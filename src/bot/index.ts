import { trainerIdCommand } from './member/trainer_id';
import { updateMemberNicknameEvent } from './member/update_member_nickname';
import { registerNextMonthCircleCommand } from './register_next_month_circle';
import { selectCircleReaction } from './select_circle';
import { monthSurveyReaction } from './month_survey';
import { Guild } from './../model/guild';
import { registerTrainerIdCommand } from './register_trainer_id';
import { PrismaClient } from '@prisma/client';
import { Client, Intents, Options } from 'discord.js';
import { config } from 'dotenv';
import { nextMonthCircleCommand } from './next_month_circle';
import { sendDirectMessageIfPossible } from '../discord/message';

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
    const setupUrl = `${process.env.BASE_URL}/members/path/${createdMember.pathname}/setup`;
    await sendDirectMessageIfPossible(
      createdMember,
      `ウマ娘愛好会グループへようこそ。以下の手順に従って加入手続きを行ってください。
1. サーバールールの確認画面がでてくるので、確認して同意してください。送信を押しても先に進めない場合はDiscordのアプリが最新かどうか確認してください。
2. 次のリンクを開いて必要な情報を入力してください。 ${setupUrl}
3. <#889833366126465044> を確認してください。
4. <#865547736233279508> で挨拶をお願いします。
5. ゲーム内のサークルはリーダーかサブリーダーから勧誘が来ますので、お待ちください。

不明な点がありましたら <#870289174232702986> で気軽に質問してください！

それではこれからよろしくお願いします。`
    );
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
    if (user.bot) {
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
