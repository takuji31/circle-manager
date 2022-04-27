import { CommandInteraction } from "discord.js";
import { prisma } from "@circle-manager/database";
export const registerTrainerIdCommand = async (
  interaction: CommandInteraction
) => {
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

  const trainerId = interaction.options.getString("id");
  if (!trainerId || !trainerId?.match(/^[0-9]+$/)) {
    interaction.editReply({
      content: "トレーナーIDは数字で入力してください",
    });
    return;
  }

  await prisma.member.update({
    where: {
      id: memberId,
    },
    data: {
      trainerId,
    },
  });

  interaction.editReply({
    content: `トレーナーID: ${trainerId} で登録しました。`,
  });
};
