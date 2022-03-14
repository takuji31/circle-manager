import { Circles } from './../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild, nextMonthInt, thisMonthInt } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import {
  CircleKey,
  CircleRole,
  Member,
  MemberFanCount,
  MemberStatus,
  MonthCircle,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { monthCircleStateLabel } from '../model/month_circle';
import { convert, LocalDate, nativeJs, TemporalAdjusters } from '@js-joda/core';
import { DateFormats } from '../model/date';

config();

(async () => {
  const nextMonth = nextMonthInt();

  const where = {
    ...nextMonth,
    OR: [
      {
        member: {
          circleKey: null,
        },
      },
      {
        member: {
          status: {
            in: [
              MemberStatus.Kicked,
              MemberStatus.Leaved,
              MemberStatus.NotJoined,
            ],
          },
        },
      },
      {
        member: {
          status: MemberStatus.OB,
        },
        value: MonthSurveyAnswerValue.None,
      },
    ],
  };

  const monthSurvey = await prisma.monthSurveyAnswer.findMany({
    where,
    include: { member: true },
  });

  console.log(monthSurvey);

  await prisma.monthSurveyAnswer.deleteMany({ where });
})();
