import { getCircleName } from './../model/circle';
import { CommandInteraction } from 'discord.js';
import { prisma } from '../database';
import { nextMonth } from '../model';

export const nextMonthCircleCommand = async (
  interaction: CommandInteraction
) => {
  // ignore when develop
  if (process.env.NODE_ENV != 'production') return;

  await interaction.deferReply({ ephemeral: true });
  const memberId = interaction.user.id;
  const month = nextMonth();

  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    interaction.editReply({
      content: `メンバーとして登録されていません。サブアカウントからアクセスしている場合はメインアカウントから行ってください。`,
    });
    return;
  }

  const monthCircle = await prisma.monthCircle.findUnique({
    where: {
      year_month_memberId: {
        ...month,
        memberId,
      },
    },
    include: {
      circle: true,
    },
  });

  interaction.editReply({
    content: `${month.year}年${month.month}月の在籍希望は「${
      monthCircle?.circle ? getCircleName(monthCircle.circle) : '未回答'
    }」です。変更は在籍希望アンケートのメッセージにリアクションで行ってください。`,
  });
};
