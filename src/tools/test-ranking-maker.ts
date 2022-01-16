import { Circles } from './../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild, nextMonth, thisMonth } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import { Temporal } from 'proposal-temporal';

config();

(async () => {
  const { year, month } = thisMonth();
  const { year: nextYear, month: _nextMonth } = nextMonth();
  const aggregate = await prisma.memberFanCount.aggregate({
    _max: {
      date: true,
    },
    where: {
      date: {
        gte: new Date(
          Temporal.PlainDate.from({
            year: parseInt(year),
            month: parseInt(month),
            day: 1,
          }).toString()
        ),
        lt: new Date(
          Temporal.PlainDate.from({
            year: parseInt(nextYear),
            month: parseInt(_nextMonth),
            day: 1,
          }).toString()
        ),
      },
    },
  });
  if (!aggregate._max.date) {
    return;
  }

  const date = aggregate._max.date;

  const fanCounts = await prisma.memberFanCount.findMany({
    where: { date },
    include: {
      member: true,
    },
    orderBy: [
      // {
      //   member: {
      //     circleRole: 'asc',
      //   },
      // },
      {
        total: 'desc',
      },
    ],
  });

  const rest = createDiscordRestClient();

  const plainDate = Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: {
      content: `${plainDate.toLocaleString('ja-JP')}のランキング`,
    },
    attachments: [
      {
        fileName: 'ranking.csv',
        rawBuffer: Buffer.from(
          stringify([
            ['順位', 'トレーナー名', '現在のサークル', 'ファン数'],
            ...fanCounts.map((fanCount, idx) => [
              idx + 1,
              fanCount.member?.name ?? `${fanCount.name}(メンバー情報不明)`,
              Circles.findByCircleKey(fanCount.circle).name,
              fanCount.total.toString(),
            ]),
          ]),
          'utf-8'
        ),
      },
    ],
  });
})();
