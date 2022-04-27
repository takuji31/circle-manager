import { CommandInteraction } from "discord.js";
import { prisma } from "database";
export const trainerIdCommand = async (interaction: CommandInteraction) => {
  // ignore when develop
  if (process.env.NODE_ENV != "production") return;

  await interaction.deferReply({ ephemeral: true });
  const memberId = interaction.user.id;
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    interaction.editReply({
      content: `メンバーとして登録されていません。サブアカウントからアクセスしている場合はメインアカウントから行ってください。`,
    });
    return;
  }

  const url = `${process.env.BASE_URL}/members/${member.pathname}/edit`;
  interaction.editReply({
    content:
      (member.trainerId
        ? `あなたのトレーナーIDは \`${member.trainerId}\` です。`
        : `トレーナーIDが登録されていません。`) +
      `\nトレーナーIDの登録・変更は下記のURLから行ってください。\n${url}`,
  });
};
