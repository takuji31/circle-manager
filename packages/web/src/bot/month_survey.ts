import { ReactionHandlerWithData } from './types';
import { prisma } from '../database';
import {
  CircleKey,
  MemberStatus,
  MonthSurvey,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { isValidMonthSurveyEmoji, MonthSurveyEmoji } from '../model/emoji';
import { monthSurveyAnswerLabel } from '../model/month_survey_answer';

export const monthSurveyReaction: ReactionHandlerWithData<MonthSurvey> = async (
  reaction,
  user,
  emoji,
  data
) => {
  await reaction.users.remove(user.id);

  const member = await prisma.member.findUnique({
    where: { id: user.id },
  });

  if (!member) {
    return;
  }

  if (data.expiredAt.getTime() <= new Date().getTime()) {
    await user.send('在籍希望アンケートの期限が過ぎています。');
    return;
  }

  const { year, month } = data;
  const { id: memberId, circleKey, status } = member;

  if (!circleKey) {
    await user.send('サークルに所属していません。');
    return;
  }

  if (status == MemberStatus.NotJoined) {
    await user.send(
      'サークルに未加入です。先に初期設定を完了してください。加入申請が承認されると回答できるようになります。'
    );
    return;
  }

  if (!isValidMonthSurveyEmoji(emoji)) {
    await user.send(
      '不明な絵文字です、在籍希望アンケートには決められた絵文字でリアクションしてください。'
    );
    return;
  }

  const value: MonthSurveyAnswerValue =
    emoji == MonthSurveyEmoji.saikyo
      ? MonthSurveyAnswerValue.Saikyo
      : emoji == MonthSurveyEmoji.umamusume
      ? MonthSurveyAnswerValue.Umamusume
      : emoji == MonthSurveyEmoji.leave
      ? MonthSurveyAnswerValue.Leave
      : emoji == MonthSurveyEmoji.ob
      ? MonthSurveyAnswerValue.Ob
      : MonthSurveyAnswerValue.None;

  await prisma.monthSurveyAnswer.upsert({
    where: {
      year_month_memberId: { year, month, memberId },
    },
    create: {
      year,
      month,
      memberId,
      circleKey,
      value,
    },
    update: {
      year,
      month,
      memberId,
      circleKey,
      value,
    },
  });

  const url = `${process.env.BASE_URL}/members/${member.pathname}/edit`;
  if (value == MonthSurveyAnswerValue.Leave) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「脱退」で受け付けました。大変残念ですが、新天地での活躍をお祈りします。当サークルに在籍していただきありがとうございました :person_bowing:`
    );
  } else if (value == MonthSurveyAnswerValue.Ob) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「脱退」で受け付けました。Discord残留とのことですので、引き続きよろしくお願いします。`
    );
  } else if (
    value == MonthSurveyAnswerValue.Saikyo &&
    circleKey == CircleKey.Saikyo
  ) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「西京ファーム」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`
    );
  } else if (value == MonthSurveyAnswerValue.Saikyo) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「西京ファーム」で受け付けました。トレーナーIDの登録がまだの方は以下のリンクからトレーナーIDの登録をお願いします。\n${url}`
    );
  } else if (value == MonthSurveyAnswerValue.Umamusume) {
    await user.send(
      `${year}年${month}月の在籍希望アンケートを「ウマ娘愛好会」で受け付けました。入れ替えの対象になった場合トレーナーIDが必要ですので、登録がまだの方は以下のリンクから今すぐトレーナーIDの登録をお願いします。\n${url}`
    );
  }
};

export const monthSurveyShowReaction: ReactionHandlerWithData<
  MonthSurvey
> = async (reaction, user, _, data) => {
  await reaction.users.remove(user.id);

  const member = await prisma.member.findUnique({
    where: { id: user.id },
  });

  if (!member) {
    return;
  }

  const { year, month } = data;
  const answer = await prisma.monthSurveyAnswer.findUnique({
    where: {
      year_month_memberId: {
        year,
        month,
        memberId: user.id,
      },
    },
  });

  if (!answer) {
    await user.send('この在籍希望アンケートは対象ではないため回答不要です。');
    return;
  }
  const value = answer.value;
  if (value == MonthSurveyAnswerValue.None) {
    await user.send(
      `あなたの${year}年${month}月の在籍希望は未回答です。回答がない場合は除名となりますのでご注意ください。`
    );
    return;
  } else {
    await user.send(
      `あなたの${year}年${month}月の在籍希望は「${
        value ? monthSurveyAnswerLabel(value) : ''
      }」です。変更がある場合は期限内に再度希望内容の絵文字でリアクションしてください。`
    );
  }
};
