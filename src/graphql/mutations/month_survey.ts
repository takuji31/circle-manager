import { getCircleName, Circles } from './../../model/circle';
import { Guild } from './../../model/guild';
import { Circle } from '@prisma/client';
import { Temporal } from 'proposal-temporal';
import { createDiscordRestClient } from '../../discord';
import { nextMonth } from '../../model';
import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { mutationField } from 'nexus';
import { MessageEmbed } from 'discord.js';
import {
  RESTPostAPIWebhookWithTokenWaitResult,
  Routes,
} from 'discord-api-types/v9';
import { CreateNextMonthSurveyPayload } from '../types';

export const CreateNextMonthSurveyMutation = mutationField(
  'createNextMonthSurvey',
  {
    type: CreateNextMonthSurveyPayload,
    async resolve(_, __, { prisma, user }) {
      if (!user?.isAdmin) {
        throw new Error('Cannot crate month survey.');
      }

      const { year, month } = nextMonth();
      const expiredAt = Temporal.PlainDate.from({
        year: parseInt(year),
        month: parseInt(month),
        day: 1,
      })
        .subtract(Temporal.Duration.from({ days: 4 }))
        .toZonedDateTime({
          timeZone: 'Asia/Tokyo',
          plainTime: Temporal.PlainTime.from({ hour: 0, minute: 0, second: 0 }),
        });

      if (await prisma.monthSurvey.count({ where: { year, month } })) {
        throw new Error('Next month survey already started');
      }

      const rest = createDiscordRestClient();

      const embed = new MessageEmbed()
        .setTitle(`${year}年${month}月の在籍希望アンケート`)
        .setDescription(
          '来月の在籍希望に関するアンケートです。\n**来月も同じサークルに所属する場合も**必ずご回答ください！\n回答を受け付けたら**リアクションは消えます**、ご注意ください。'
        )
        .addField(
          '期限',
          `${expiredAt.toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
            hour: 'numeric',
          })}まで`
        )
        .addField('回答方法', 'このメッセージにリアクション');

      const circles: Array<Circle> = await prisma.circle.findMany({
        where: { selectableInSurvey: true },
        orderBy: { order: 'asc' },
      });
      circles.forEach((circle) => {
        embed.addField(`${getCircleName(circle)}`, `${circle.emoji}`, true);
      });

      embed.addField('未回答の場合', '***除名となります。***');
      embed.addField(
        '回答状態の確認方法',
        `任意のチャンネル(例: <#${
          Guild.channelIds.commandExecutor
        }>)で ${'`/next-month-circle`'} と送信すると確認できます。`
      );

      const { id: messageId, channel_id: channelId } = (await rest.post(
        Routes.channelMessages(Guild.channelIds.all),
        {
          body: {
            content: process.env.NODE_ENV == 'production' ? '@everyone' : '',
            embeds: [embed],
            allowed_mentions: {
              parse: ['everyone'],
            },
          },
        }
      )) as RESTPostAPIWebhookWithTokenWaitResult;

      const monthSurvey = await prisma.monthSurvey.create({
        data: {
          id: messageId,
          year,
          month,
          expiredAt: new Date(expiredAt.epochMilliseconds),
        },
      });

      const members = await prisma.member.findMany({
        where: {
          circle: {
            selectableByUser: true,
          },
        },
      });

      await prisma.monthCircle.createMany({
        data: members.map(({ id, circleId }) => ({
          memberId: id,
          currentCircleId: circleId!!,
          year,
          month,
          circleId: Circles.specialIds.noAnswer,
        })),
        skipDuplicates: true,
      });

      const emojiNames = [...circles.map((circle) => circle.emoji)];
      emojiNames.forEach(async (emoji) => {
        if (emoji) {
          await rest.put(
            Routes.channelMessageOwnReaction(channelId, messageId, `${emoji}`)
          );
        }
      });

      return {
        nextMonth: {
          year,
          month,
          survey: monthSurvey,
        },
      };
    },
  }
);
