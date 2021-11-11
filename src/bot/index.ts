import { trainerIdCommand } from './member/trainer_id';
import { updateMemberNicknameEvent } from './member/update_member_nickname';
import { registerNextMonthCircleCommand } from './register_next_month_circle';
import { selectCircleReaction } from './select_circle';
import { monthSurveyReaction } from './month_survey';
import { Guild } from './../model/guild';
import { registerTrainerIdCommand } from './register_trainer_id';
import { PrismaClient } from '@prisma/client';
import { Client, Intents } from 'discord.js';
import { config } from 'dotenv';
import { nextMonthCircleCommand } from './next_month_circle';

config();

const client = new Client({
  partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'USER'],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

const prisma = new PrismaClient();

client.on('guildUpdate', async (guild) => {
  console.log('guildUpdate %s', guild);
});

client.on('ready', async () => {
  console.log('ready');
});

client.on('guildMemberRemove', async (member) => {
  console.log('Member removed %s', member);
  try {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        circleId: null,
        leavedAt: new Date(),
      },
    });
  } catch (e) {
    console.log('Error when guildMemberRemove %s', e);
  }
});

client.on('guildMemberAdd', async (member) => {
  console.log('Member added %s', member);
  try {
    await prisma.member.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
        joinedAt: member.joinedAt ?? new Date(),
        name: member.nickname ?? member.user.username,
      },
      update: {
        leavedAt: null,
      },
    });
  } catch (e) {
    console.log('Error when guildMemberRemove %s', e);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  await updateMemberNicknameEvent(oldMember, newMember);
});

client.on('messageCreate', async () => {
  console.log('messageCreated');
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    if (interaction.commandName == 'next-month-circle') {
      nextMonthCircleCommand(interaction);
    }
    if (interaction.commandName == 'register-trainer-id') {
      registerTrainerIdCommand(interaction);
    }
    if (interaction.commandName == 'trainer-id') {
      trainerIdCommand(interaction);
    }
    if (interaction.commandName == 'register-next-month-circle') {
      registerNextMonthCircleCommand(interaction);
    }
  } catch (e) {
    console.log('Error when interactionCreate %s', e);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (reaction.me) {
      return;
    }
    const emoji = reaction.emoji.name;
    if (!emoji) {
      return;
    }

    if (reaction.message.id == Guild.messageIds.circleSelect) {
      selectCircleReaction(reaction, user, emoji);
    } else {
      monthSurveyReaction(reaction, user, emoji);
    }
  } catch (e) {
    console.log('Error when messageReactionAdd %s', e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
