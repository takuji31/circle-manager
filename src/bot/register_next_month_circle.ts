import { CommandInteraction } from 'discord.js';
import { prisma } from '../database';
import { nextMonth } from '../model';
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
      state: 'Answered',
    },
    update: {
      circleId: circle.id,
      currentCircleId: member.circleId,
      state: 'Answered',
    },
  });

  if (circle.id == member.circle?.id) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「${circle.name}」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`,
    });
  } else if (member.trainerId) {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。トレーナーID入力済みですので、追加の手続きは必要ありません。月初にサークル勧誘と除名が行われますので、除名され次第希望のサークルからの勧誘を承諾して異動をお願いします。`,
    });
  } else {
    await interaction.editReply({
      content: `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。異動にはトレーナーIDの入力が必要です。ゲームのプロフィール画面の「IDコピー」を押してDiscordのサーバー上で \`/register-trainer-id\` と入力してトレーナーIDを登録してください。`,
    });
  }
};
