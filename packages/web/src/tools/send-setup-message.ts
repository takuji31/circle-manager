import { sendSetupMessage } from '../discord/member/messages';
import { prisma } from '../database';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';

config();

const rest = createDiscordRestClient();

(async () => {
  try {
    const memberId = process.argv[2];
    if (!memberId) {
      throw new Error('Usage: send-setup-message.ts [memberId]');
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new Error(`Member id:${memberId} not found.`);
    }

    const message = await sendSetupMessage(member);
    console.log('message sent');
  } catch (error) {
    console.error(error);
  }
})().catch((e) => console.log(e));
