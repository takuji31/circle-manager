import { prisma } from './../database/prisma';
import { Temporal } from 'proposal-temporal';
import { Guild } from './../model/guild';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { Circle } from '../model';
import fetch from 'node-fetch';
export interface UmastagramPage {
  members: Array<UmastagramMember>;
  circle: UmastagramCircle;
}

export interface UmastagramMember {
  name: string;
  total: string;
  avg: string;
  predicted: string;
  completeDay: string;
}

export interface UmastagramCircle {
  total: string;
  avg: string;
  predictedTotal: string;
  predictedAvg: string;
}

const toHalfWidthString = (str: string) => {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace('：', ':')
    .replace('　', ' ');
};

export async function crawlUmastagram(
  url: string,
  circle: Circle,
  plainDate: Temporal.PlainDate = Temporal.now
    .plainDate('iso8601', 'Asia/Tokyo')
    .subtract(Temporal.Duration.from({ days: 1 }))
): Promise<UmastagramPage> {
  const rest = createDiscordRestClient();
  const date = new Date(plainDate.toString());

  try {
    const response = await fetch(
      `https://us-central1-shin-umamusume-336911.cloudfunctions.net/getUmastagramFanCounts?url=${url}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.error);
    }

    const result: UmastagramPage = await response.json();
    const { circle: circleResult, members } = result;

    const circleKey = circle.key;

    const dbMembers = await prisma.member.findMany({
      where: {
        circleKey,
      },
    });

    const circleFanCountData = {
      circle: circleKey,
      date,
      total: BigInt(circleResult.total.replaceAll(',', '')),
      avg: BigInt(circleResult.avg.replaceAll(',', '')),
      predicted: BigInt(circleResult.predictedAvg.replaceAll(',', '')),
      predictedAvg: BigInt(circleResult.predictedTotal.replaceAll(',', '')),
    };
    await prisma.$transaction([
      prisma.memberFanCount.deleteMany({
        where: { circle: circleKey, date },
      }),
      prisma.memberFanCount.createMany({
        data: [
          ...members.map((member) => {
            const dbMember = dbMembers.find(
              (m) => toHalfWidthString(m.name) == toHalfWidthString(member.name)
            );
            const memberId = dbMember?.id ?? null;
            return {
              circle: circleKey,
              date,
              name: member.name,
              memberId,
              total: BigInt(member.total.replaceAll(',', '')),
              avg: BigInt(member.avg.replaceAll(',', '')),
              predicted: BigInt(member.predicted.replaceAll(',', '')),
            };
          }),
        ],
        skipDuplicates: false,
      }),
      prisma.circleFanCount.upsert({
        where: {
          circle_date: {
            circle: circleKey,
            date,
          },
        },
        create: circleFanCountData,
        update: circleFanCountData,
      }),
    ]);

    await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
      body: {
        content: `${circle.name}の ${plainDate.toLocaleString(
          'ja-JP'
        )}のファン数を取得しました。`,
      },
      attachments: [
        {
          fileName: 'result.json',
          rawBuffer: Buffer.from(JSON.stringify(members, null, 2), 'utf-8'),
        },
      ],
    });

    return result;
  } catch (e) {
    await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
      body: {
        content:
          `${circle.name}の ${plainDate.toLocaleString(
            'ja-JP'
          )}のファン数を取得できませんでした。\n` +
          '```\n' +
          `${e}`.substring(0, 1800) +
          `\n` +
          '```',
      },
    });
    throw e;
  }
}
