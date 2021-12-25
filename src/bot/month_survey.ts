import { Guild } from './../model/guild';
import { Circles, getCircleName } from './../model/circle';
import { ReactionHandler, ReactionHandlerWithData } from './types';
import { Temporal } from 'proposal-temporal';
import { prisma } from '../database';
import { MonthSurvey } from '@prisma/client';

export const monthSurveyReaction: ReactionHandlerWithData<MonthSurvey> = async (
  reaction,
  user,
  emoji,
  data
) => {
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

  if (data.expiredAt.getTime() <= Temporal.now.instant().epochMilliseconds) {
    await user.send('在籍希望アンケートの期限が過ぎています。');
    return;
  }

  const { year, month } = data;
  const { id: memberId, circleId, circle: currentCircle } = member;

  if (!circleId) {
    await user.send('サークルに所属していません。');
    return;
  }

  if (currentCircle?.id == Circles.specialIds.notJoined) {
    await user.send(
      'サークルに未加入です。先に<#889836038221099038>をしてください。加入申請が承認されると回答できるようになります。'
    );
    return;
  }

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
    },
    update: {
      year,
      month,
      memberId,
      circleId: circle.id,
      currentCircleId: circleId,
    },
  });

  if (circle.id == Circles.specialIds.leave) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。大変残念ですが、新天地での活躍をお祈りします。当サークルに在籍していただきありがとうございました :person_bowing:`
    );
  } else if (circle.id == Circles.specialIds.ob) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。Discord残留とのことですので、引き続きよろしくお願いします。`
    );
  } else if (circle.id == member.circle?.id) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「${circle.name}」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`
    );
  } else if (member.trainerId) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「${circle.name}」への移籍で受け付けました。トレーナーID入力済みですので、追加の手続きは必要ありません。月初にサークル勧誘と除名が行われますので、除名され次第希望のサークルからの勧誘を承諾して異動をお願いします。`
    );
  } else {
    const url = `${process.env.BASE_URL}/members/${member.pathname}/edit`;
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「${circle.name}」への移籍で受け付けました。移籍にはトレーナーIDの入力が必要です。以下のURLでトレーナーIDを登録してください。\n${url}`
    );
  }
};

export const monthSurveyShowReaction: ReactionHandlerWithData<
  MonthSurvey
> = async (reaction, user, _, data) => {
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

  const { year, month } = data;
  const monthCircle = await prisma.monthCircle.findUnique({
    where: {
      year_month_memberId: {
        year,
        month,
        memberId: user.id,
      },
    },
    include: {
      circle: true,
    },
  });

  if (!monthCircle) {
    await user.send('この在籍希望アンケートは対象ではないため回答不要です。');
    return;
  }

  if (monthCircle.circleId == Circles.specialIds.noAnswer) {
    await user.send(
      `あなたの${year}年${month}月の在籍希望は未回答です。回答がない場合は除名となりますのでご注意ください。`
    );
    return;
  } else if (monthCircle.circleId == Circles.specialIds.kick) {
    await user.send(
      `あなたは${year}年${month}月の除名対象となっています。除名対象になった理由については運営メンバーにお問い合わせください。`
    );
    return;
  } else {
    await user.send(
      `あなたの${year}年${month}月の在籍希望は「${getCircleName(
        monthCircle.circle
      )}」です。変更がある場合は期限内に再度希望内容の絵文字でリアクションしてください。`
    );
  }
};
