import { sendSetupMessage } from './../discord/member/setup_message';
import { trainerIdCommand } from './member/trainer_id';
import { updateMemberNicknameEvent } from './member/update_member_nickname';
import { registerNextMonthCircleCommand } from './register_next_month_circle';
import { monthSurveyReaction, monthSurveyShowReaction } from './month_survey';
import { registerTrainerIdCommand } from './register_trainer_id';
import { PrismaClient } from '@prisma/client';
import { Client, Intents, Options } from 'discord.js';
import { config } from 'dotenv';
import { nextMonthCircleCommand } from './next_month_circle';
import { Emoji } from '../model/emoji';
import { Circle, Circles } from '../model';
import { updateFanCountEvent } from './circle/update_fan_count';

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
  makeCache: Options.cacheEverything(),
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
    const createdMember = await prisma.member.upsert({
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
    if (process.env.NODE_ENV != 'production') return;
    await sendSetupMessage(createdMember);
  } catch (e) {
    console.log('Error when guildMemberRemove %s', e);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  await updateMemberNicknameEvent(oldMember, newMember);
});

client.on('messageCreate', async (message) => {
  console.log('messageCreated');
  const notificationCircle = Circles.findByRawNotificationChannelId(
    message.channel.id
  );
  if (notificationCircle) {
    updateFanCountEvent(message, notificationCircle);
  }
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
    if (user.bot) {
      return;
    }
    const emoji = reaction.emoji.name;
    if (!emoji) {
      return;
    }

    const survey = await prisma.monthSurvey.findUnique({
      where: {
        id: reaction.message.id,
      },
    });
    if (survey && emoji == Emoji.eyes) {
      monthSurveyShowReaction(reaction, user, emoji, survey);
    } else if (survey) {
      monthSurveyReaction(reaction, user, emoji, survey);
    }
  } catch (e) {
    console.log('Error when messageReactionAdd %s', e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
