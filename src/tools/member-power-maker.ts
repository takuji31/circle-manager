import { config } from 'dotenv';
import { prisma } from '../database';
import { Circles, Guild } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import {
  CircleKey,
  MemberStatus,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { LocalDate } from '../model/date';

config();

const powerFactors: Record<number, number> = {
  1: 0.9,
  2: 0.95,
  3: 1.0,
};

class MemberPower {
  public power: number;
  private monthPowers: Array<number | null>;
  constructor(
    private name: string,
    private circle: CircleKey,
    private fanCount1: number | null,
    private fanCount2: number | null,
    private fanCount3: number | null
  ) {
    const fanCounts = [this.fanCount1, this.fanCount2, this.fanCount3];
    this.monthPowers = fanCounts.map((fanCount, index) => {
      const factor = powerFactors[index + 1];
      return fanCount != null && factor != null
        ? Math.round(fanCount * factor)
        : null;
    });
    const nonNullMonthPower = this.monthPowers.filter(
      (power) => power != null
    ) as Array<number>;

    this.power = Math.round(
      nonNullMonthPower.reduce((prev, current) => {
        return prev + current;
      }, 0.0) / nonNullMonthPower.length
    );
  }

  toCSVRow(rank: number): Array<any> {
    return [
      rank,
      this.name,
      Circles.findByCircleKey(this.circle).name,
      this.power,
      this.fanCount3,
      this.monthPowers[2],
      this.fanCount2,
      this.monthPowers[1],
      this.fanCount1,
      this.monthPowers[0],
    ];
  }
}

(async () => {
  const members = await prisma.member.findMany({
    include: {
      fanCounts: {
        where: {
          date: {
            gte: LocalDate.of(2022, 1, 1).toUTCDate(),
          },
        },
        // 日付ずれがファン数記録実装当初からあった可能性があるので、各月で合計値が最大のものが最新のデータだと判定するためにtotalの降順でソートしている
        orderBy: [
          {
            total: 'desc',
          },
          {
            date: 'desc',
          },
        ],
      },
    },
    where: {
      circleKey: {
        in: [CircleKey.Shin, CircleKey.Ha, CircleKey.Jo],
      },
      status: MemberStatus.Joined,
      monthSurveyAnswer: {
        some: {
          year: 2022,
          month: 4,
          value: {
            in: [MonthSurveyAnswerValue.Umamusume, MonthSurveyAnswerValue.None],
          },
        },
      },
    },
    orderBy: [
      {
        circleKey: 'asc',
      },
      {
        circleRole: 'asc',
      },
    ],
  });

  const memberPowers: Array<MemberPower> = [];

  for (const member of members) {
    const months = [1, 2, 3];
    const fanCounts: [number | null, number | null, number | null] = [
      null,
      null,
      null,
    ];
    for (const month of months) {
      const fanCount = member.fanCounts.filter((fanCount) => {
        const date = LocalDate.fromUTCDate(fanCount.date);
        return date.year() == 2022 && date.monthValue() == month;
      })[0];
      fanCounts[month - 1] = fanCount
        ? parseInt(fanCount.predicted.toString())
        : null;
    }
    memberPowers.push(
      new MemberPower(
        member.name,
        member.circleKey!,
        fanCounts[0],
        fanCounts[1],
        fanCounts[2]
      )
    );
  }

  const rest = createDiscordRestClient();

  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: {
      content: `メンバーのファン数パワーを算出しました`,
    },
    attachments: [
      {
        fileName: 'member_powers.csv',
        rawBuffer: Buffer.from(
          stringify([
            [
              '順位',
              'トレーナー名',
              '現在のサークル',
              'メンバーパワー',
              '2022年3月のファン数',
              '2022年3月のパワー',
              '2022年2月のファン数',
              '2022年2月のパワー',
              '2022年1月のファン数',
              '2022年1月のパワー',
            ],
            ...memberPowers
              .sort((a, b) => b.power - a.power)
              .map((power, index) => power.toCSVRow(index + 1)),
          ]),
          'utf-8'
        ),
      },
    ],
  });
})();
