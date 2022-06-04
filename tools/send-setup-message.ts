import { prisma } from "@/database";
import { createDiscordRestClient, sendWelcomeMessage } from "@/discord";
import { config } from "dotenv";
import { logger } from "~/lib/logger";

config();

const rest = createDiscordRestClient();

(async () => {
  const memberId = process.argv[2];
  if (!memberId) {
    throw new Error("Usage: send-setup-message.ts [memberId]");
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    throw new Error(`Member id:${memberId} not found.`);
  }

  await sendWelcomeMessage(member);
})().catch(error => logger.error(error));
