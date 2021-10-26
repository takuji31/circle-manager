import { ReactionHandler } from './types';
import { MonthCircleAnswerState } from '@prisma/client';
import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { Temporal } from 'proposal-temporal';
import { prisma } from '../database';
import { Emojis } from '../model/emoji';

export const monthSurveyReaction: ReactionHandler = async (
  reaction,
  user,
  emoji
) => {
  // ignore when develop
  if (process.env.NODE_ENV != 'production') return;

  const survey = await prisma.monthSurvey.findUnique({
    where: {
      id: reaction.message.id,
    },
  });
  if (!survey) {
    return;
  }

  await reaction.users.remove(user.id);

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    include: {
      circle: true,
    },
  });

  if (!member) {
    return;
  }

  if (survey.expiredAt.getTime() <= Temporal.now.instant().epochMilliseconds) {
    await user.send('在籍希望アンケートの期限が過ぎています。');
    return;
  }

  const { year, month } = survey;
  const { id: memberId, circleId } = member;

  if (!circleId) {
    await user.send('サークルに所属していません。');
    return;
  }

  if (emoji == Emojis.leave) {
    await prisma.monthCircle.upsert({
      where: {
        year_month_memberId: { year, month, memberId },
      },
      create: {
        year,
        month,
        memberId,
        circleId: null,
        currentCircleId: circleId,
        state: MonthCircleAnswerState.Retired,
      },
      update: {
        year,
        month,
        memberId,
        circleId: null,
        currentCircleId: circleId,
        state: MonthCircleAnswerState.Retired,
      },
    });
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。大変残念ですが、新天地での活躍をお祈りします。当サークルに在籍していただきありがとうございました :person_bowing:`
    );
  } else {
    const circle = await prisma.circle.findFirst({ where: { emoji } });
    if (!circle) {
      await user.send(
        '不明な絵文字です、在籍希望アンケートには決められた絵文字でリアクションしてください。'
      );
      return;
    }

    await prisma.monthCircle.upsert({
      where: {
        year_month_memberId: { year, month, memberId },
      },
      create: {
        year,
        month,
        memberId,
        circleId: circle.id,
        currentCircleId: circleId,
        state: MonthCircleAnswerState.Answered,
      },
      update: {
        year,
        month,
        memberId,
        circleId: circle.id,
        currentCircleId: circleId,
        state: MonthCircleAnswerState.Answered,
      },
    });

    if (circle.id == member.circle?.id) {
      await user.send(
        `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「${circle.name}」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`
      );
    } else if (member.trainerId) {
      await user.send(
        `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。トレーナーID入力済みですので、追加の手続きは必要ありません。月初にサークル勧誘と除名が行われますので、除名され次第希望のサークルからの勧誘を承諾して異動をお願いします。`
      );
    } else {
      await user.send(
        `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。異動にはトレーナーIDの入力が必要です。ゲームのプロフィール画面の「IDコピー」を押してDiscordのサーバー上で \`/register_trainer_id\` と入力してトレーナーIDを登録してください。`
      );
    }
  }
};
