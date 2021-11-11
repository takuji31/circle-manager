import { Circles } from './../model/circle';
import { ReactionHandler } from './types';
import { Temporal } from 'proposal-temporal';
import { prisma } from '../database';

export const monthSurveyReaction: ReactionHandler = async (
  reaction,
  user,
  emoji
) => {
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
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「${circle.name}」への移籍で受け付けました。移籍にはトレーナーIDの入力が必要です。ゲームのプロフィール画面の「IDコピー」を押してDiscordのサーバー上で \`/register-trainer-id\` と入力してトレーナーIDを登録してください。`
    );
  }
};
