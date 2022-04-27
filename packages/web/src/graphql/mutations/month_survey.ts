import { Guild } from 'model';
import { Member, MemberStatus } from '@prisma/client';
import { createDiscordRestClient } from '@circle-manager/discord';
import { nextMonthInt } from 'model';
import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { mutationField } from 'nexus';
import { MessageEmbed } from 'discord.js';
import {
  RESTPostAPIWebhookWithTokenWaitResult,
  Routes,
} from 'discord-api-types/v9';
import { CreateNextMonthSurveyPayload } from '../types';
import { Emoji, MonthSurveyEmoji } from 'model';
import { DateFormats, convert, LocalDate } from 'model';

export const CreateNextMonthSurveyMutation = mutationField(
  'createNextMonthSurvey',
  {
    type: CreateNextMonthSurveyPayload,
    async resolve(_, __, { prisma, user }) {
      if (!user?.isAdmin) {
        throw new Error('Cannot crate month survey.');
      }

      const { year, month } = nextMonthInt();
      const expiredAt = LocalDate.firstDayOfNextMonth().minusDays(12);

      if (
        await prisma.monthSurvey.count({
          where: { year, month },
        })
      ) {
        throw new Error('Next month survey already started');
      }

      const rest = createDiscordRestClient();

      const embed = new MessageEmbed()
        .setTitle(`${year}年${month}月の在籍希望アンケート`)
        .setDescription(
          '来月の在籍希望に関するアンケートです。\n**来月も同じサークルに所属する場合も**必ずご回答ください！\n回答を受け付けたら結果がbotからメッセージで送られてくるので**必ず**、確認してください。'
        )
        .addField(
          '対象者',
          'このメッセージが送信された時点でサークルに所属しているメンバー/来月復帰予定のOB'
        )
        .addField(
          '対象外の方',
          'このメッセージが送信された時点で加入申請中のメンバー/来月復帰予定のないOB'
        )
        .addField(
          '期限',
          `${expiredAt.atStartOfDay().format(DateFormats.dateWithHour)}まで`
        )
        .addField('回答方法', 'このメッセージにリアクション');

      embed.addField('西京ファーム', Emoji.a, true);
      embed.addField('ウマ娘愛好会(ランキング制)', Emoji.b, true);
      embed.addField('脱退', Emoji.c, true);
      embed.addField('脱退(Discord残留)', Emoji.d, true);

      embed.addField('未回答の場合', '***除名となります。***');
      embed.addField(
        '回答状態の確認方法',
        `このメッセージに:eyes:でリアクション`
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
          expiredAt: expiredAt.atStartOfDayJST().toDate(),
        },
      });

      const members = await prisma.member.findMany({
        where: {
          circleKey: {
            not: null,
          },
          status: MemberStatus.Joined,
        },
      });

      await prisma.monthSurveyAnswer.createMany({
        data: members.map(({ id, circleKey }: Member) => ({
          memberId: id,
          circleKey: circleKey!!,
          year,
          month,
        })),
        skipDuplicates: true,
      });

      const emojiNames = [
        MonthSurveyEmoji.saikyo,
        MonthSurveyEmoji.umamusume,
        MonthSurveyEmoji.leave,
        MonthSurveyEmoji.ob,
        Emoji.eyes,
      ];

      for (const emoji of emojiNames) {
        await rest.put(
          Routes.channelMessageOwnReaction(channelId, messageId, emoji)
        );
      }

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
