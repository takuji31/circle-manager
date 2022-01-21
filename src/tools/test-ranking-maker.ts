import { Circles } from './../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild, nextMonth, thisMonth } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import { Temporal } from 'proposal-temporal';
import { CircleKey, Member, MemberFanCount } from '@prisma/client';

config();

(async () => {
  const { year, month } = thisMonth();
  const { year: nextYear, month: _nextMonth } = nextMonth();

  const groupBy = await prisma.memberFanCount.groupBy({
    _max: {
      date: true,
    },
    by: ['circle'],
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

  let memberFanCounts: Array<MemberFanCount & { member: Member | null }> = [];
  const circleToUpdatedAt: Record<CircleKey, Temporal.PlainDate | null> = {
    Saikyo: null,
    Shin: null,
    Ha: null,
    Jo: null,
  };
  for (const group of groupBy) {
    const date = group._max.date;
    const circle = group.circle;
    if (!date) {
      continue;
    }

    const updatedAt = Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    circleToUpdatedAt[circle] = updatedAt;

    const fanCounts = await prisma.memberFanCount.findMany({
      where: { date, circle },
      include: {
        member: true,
      },
      orderBy: [
        {
          total: 'desc',
        },
      ],
    });
    memberFanCounts.push(...fanCounts);
  }

  const rest = createDiscordRestClient();

  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: {
      content:
        `${year}年${month}月のランキング\n\n各サークルの最終更新日` +
        Object.entries(circleToUpdatedAt)
          .map((entry) => {
            const [key, updatedAt] = entry;
            return `${Circles.findByCircleKey(key as CircleKey).name} : ${
              updatedAt ? updatedAt.toLocaleString('ja-JP') : '更新なし'
            }`;
          })
          .join('\n'),
    },
    attachments: [
      {
        fileName: 'ranking.csv',
        rawBuffer: Buffer.from(
          stringify([
            [
              '順位',
              'トレーナー名',
              'メンバー情報不明',
              '現在のサークル',
              'ファン数',
              '予測ファン数',
            ],
            ...memberFanCounts
              //TODO: int
              .sort((a, b) => parseInt((b.predicted - a.predicted).toString()))
              .map((fanCount, idx) => [
                idx + 1,
                fanCount.member?.name ?? fanCount.name,
                fanCount.member ? true : false,
                Circles.findByCircleKey(fanCount.circle).name,
                fanCount.total.toString(),
                fanCount.predicted.toString(),
              ]),
          ]),
          'utf-8'
        ),
      },
    ],
  });
})();
