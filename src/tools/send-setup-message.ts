import { sendSetupMessage } from '../discord/member/messages';
import { Guild } from './../model/guild';
import { prisma } from '../database';
import { nextMonth } from '../model';
import { RESTPostAPIChannelMessageResult, Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';
import { MessageEmbed } from 'discord.js';

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

    await sendSetupMessage(member);
  } catch (error) {
    console.error(error);
  }
})();
