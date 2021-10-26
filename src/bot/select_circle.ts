import { prisma } from '../database';
import { ReactionHandler } from './types';
export const selectCircleReaction: ReactionHandler = async (
  reaction,
  user,
  emoji
) => {
  // ignore when develop
  if (process.env.NODE_ENV != 'production') return;

  await reaction.users.remove(user.id);

  const circle = await prisma.circle.findFirst({ where: { emoji } });
  if (!circle) {
    await user.send('ただしい絵文字でリアクションしてください。');
    return;
  }

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    include: {
      circle: true,
    },
  });

  if (!member) {
    await user.send(
      'メンバーのデータがありません。バグの可能性があるので幹部までお知らせください。'
    );
    return;
  }

  if (member.circle) {
    await user.send(
      '既にサークル加入済みです。未加入のはずなのにこのメッセージが出る場合は幹部までお知らせください。'
    );
    return;
  }

  const memberJoin = await prisma.memberJoin.upsert({
    where: {
      id: member.id,
    },
    create: {
      id: member.id,
      circleId: circle.id,
    },
    update: {
      circleId: circle.id,
    },
  });

  await user.send(
    `ようこそ、「${circle.name}」への加入申請を受け付けました。次にゲームのプロフィール画面で「IDコピー」を押してトレーナーIDをコピーし、Discordの任意のチャンネルで` +
      '`/register_trainer_id`と入力してトレーナーIDを登録してください。`/register_trainer_id`はコピペするとうまくいかないことがあるので、`/re`くらいまで手で入力して出てくるポップアップから選んでください。'
  );
};
