import { MonthCircleAnswerState, Circle } from '@prisma/client';
import { Member } from './member';
import { Temporal } from 'proposal-temporal';
import { createDiscordRestClient } from '../../discord';
import { nextMonth } from '../../model';
import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { mutationField, nonNull, objectType, list } from 'nexus';
import { MessageEmbed } from 'discord.js';
import {
  RESTPostAPIWebhookWithTokenWaitResult,
  Routes,
} from 'discord-api-types/v9';
import { Emojis } from '../../model/emoji';
import { Month } from './month';

export const MonthSurvey = objectType({
  name: _MonthSurvey.$name,
  description: _MonthSurvey.$description,
  definition(t) {
    t.field(_MonthSurvey.id);
    t.field(_MonthSurvey.year);
    t.field(_MonthSurvey.month);
    t.field(_MonthSurvey.expiredAt);
    t.field('answeredMembers', {
      type: nonNull(list(Member)),
      resolve(parent, _, { prisma }) {
        return prisma.member.findMany({
          where: {
            AND: [
              { circleId: { not: null } },
              {
                monthCircles: {
                  some: {
                    year: parent.year,
                    month: parent.month,
                    circleId: {
                      not: null,
                    },
                    state: {
                      not: MonthCircleAnswerState.NoAnswer,
                    },
                  },
                },
              },
            ],
          },
        });
      },
    });
    t.field('noAnswerMembers', {
      type: nonNull(list(Member)),
      resolve(parent, _, { prisma }) {
        return prisma.member.findMany({
          where: {
            AND: [
              {
                circleId: {
                  not: null,
                },
              },
              {
                monthCircles: {
                  none: {
                    year: parent.year,
                    month: parent.month,
                    circleId: {
                      not: null,
                    },
                    state: {
                      not: MonthCircleAnswerState.NoAnswer,
                    },
                  },
                },
              },
            ],
          },
        });
      },
    });
  },
});

export const CreateNextMonthSurveyPayload = objectType({
  name: 'CreateNextMonthSurveyPayload',
  definition(t) {
    t.field('nextMonth', {
      type: nonNull(Month),
    });
  },
});

export const CreateNextMonthSurveyMutation = mutationField(
  'createNextMonthSurvey',
  {
    type: CreateNextMonthSurveyPayload,
    async resolve(parent, args, { prisma, user }) {
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
        orderBy: { createdAt: 'asc' },
      });
      circles.forEach((circle) => {
        embed.addField(`${circle.name} 希望の場合`, `${circle.emoji}`);
      });

      embed.addField(`脱退予定の場合`, Emojis.leave);

      embed.addField('未回答の場合', '***除名となります。***');
      embed.addField(
        '回答状態の確認方法',
        '任意のチャンネルで `/next_month_circle` と送信すると確認できます。'
      );

      const { id: messageId, channel_id: channelId } = (await rest.post(
        Routes.channelMessages(process.env.DISCORD_MESSAGE_CHANNEL_ID),
        {
          body: {
            // content: '@everyone',
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

      const emojiNames = [
        ...circles.map((circle) => circle.emoji),
        Emojis.leave,
      ];
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
