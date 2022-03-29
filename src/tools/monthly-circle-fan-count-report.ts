import { Circle, Circles } from '../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import {
  CircleKey,
  CircleRole,
  Member,
  MemberFanCount,
  MonthCircle,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { monthCircleStateLabel } from '../model/month_circle';
import {
  LocalDate,
  DateFormats,
  TemporalAdjusters,
  DateTimeFormatter,
} from '../model/date';

config();

type CircleFanCount = {
  month: LocalDate;
  Saikyo: BigInt;
  Shin: BigInt;
  Jo: BigInt;
  Ha: BigInt;
};

(async () => {
  const firstDayOfThisMonth = LocalDate.firstDayOfThisMonth();
  const months = [
    firstDayOfThisMonth,
    firstDayOfThisMonth.minusMonths(1),
    firstDayOfThisMonth.minusMonths(2),
  ];

  const circleFanCounts: Array<CircleFanCount> = [];

  for (const month of months) {
    const monthCircleFanCount: CircleFanCount = {
      month,
      Saikyo: BigInt(0),
      Shin: BigInt(0),
      Ha: BigInt(0),
      Jo: BigInt(0),
    };
    for (const circle of Object.values(CircleKey)) {
      const circleFanCount = await prisma.circleFanCount.findFirst({
        where: {
          circle,
          date: {
            gte: month.toUTCDate(),
            lt: month.plusMonths(1).toUTCDate(),
          },
        },
        orderBy: [
          {
            total: 'desc',
          },
          {
            date: 'desc',
          },
        ],
      });
      monthCircleFanCount[circle] = circleFanCount?.predictedAvg ?? BigInt(0);
    }
    circleFanCounts.push(monthCircleFanCount);
  }

  for (const circleFanCount of circleFanCounts) {
    console.log(
      circleFanCount.month.format(
        DateTimeFormatter.ofPattern('yyyy年MMのファン数平均')
      )
    );
    for (const key of Object.values(CircleKey)) {
      const count = circleFanCount[key];
      console.log(
        '%s: %d',
        Circles.findByCircleKey(key).name,
        count.toString()
      );
    }
  }
})();
