import { CommandInteraction } from 'discord.js';
import { prisma } from '../database';
import { Circles, nextMonth } from '../model';
export const registerNextMonthCircleCommand = async (
  interaction: CommandInteraction
) => {
  // ignore when develop
  if (process.env.NODE_ENV != 'production') return;

  await interaction.deferReply({ ephemeral: true });
  const memberId = interaction.user.id;
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      circle: true,
    },
  });

  if (!member || !member.circleId) {
    interaction.editReply({
      content: `メンバーとして登録されていません。サブアカウントからアクセスしている場合はメインアカウントから行ってください。`,
    });
    return;
  }

  const circleId = interaction.options.getString('circle');
  if (!circleId) {
    interaction.editReply({
      content: 'サークルが選択されていません',
    });
    return;
  }

  const circle = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!circle) {
    interaction.editReply({
      content: '不明なサークルです',
    });
    return;
  }
  const { year, month } = nextMonth();

  const monthSurvey = await prisma.monthSurvey.findUnique({
    where: { year_month: { year, month } },
  });

  if (monthSurvey) {
    interaction.editReply({
      content:
        '既に在籍希望アンケートが開始されていますので、コマンドではなくリアクションで回答してください。',
    });
    return;
  }

  await prisma.monthCircle.upsert({
    where: {
      year_month_memberId: {
        year,
        month,
        memberId,
      },
    },
    create: {
      year,
      month,
      memberId,
      circleId: circle.id,
      currentCircleId: member.circleId,
    },
    update: {
      circleId: circle.id,
      currentCircleId: member.circleId,
    },
  });

  if (circle.id == Circles.specialIds.leave) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。大変残念ですが、新天地での活躍をお祈りします。当サークルに在籍していただきありがとうございました :person_bowing:`,
    });
  } else if (circle.id == Circles.specialIds.ob) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。Discord残留とのことですので、引き続きよろしくお願いします。`,
    });
  } else if (circle.id == member.circle?.id) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「${circle.name}」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`,
    });
  } else if (member.trainerId) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「${circle.name}」への移籍で受け付けました。トレーナーID入力済みですので、追加の手続きは必要ありません。月初にサークル勧誘と除名が行われますので、除名され次第希望のサークルからの勧誘を承諾して異動をお願いします。`,
    });
  } else {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「${circle.name}」への移籍で受け付けました。移籍にはトレーナーIDの入力が必要です。ゲームのプロフィール画面の「IDコピー」を押してDiscordのサーバー上で \`/register-trainer-id\` と入力してトレーナーIDを登録してください。`,
    });
  }
};
