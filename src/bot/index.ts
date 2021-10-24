import { Emojis } from './../model/emoji';
import { nextMonth } from '../model';
import { PrismaClient, MonthCircleAnswerState } from '@prisma/client';
import { Client, Intents } from 'discord.js';
import { Temporal } from 'proposal-temporal';
import { config } from 'dotenv';

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
      update: {},
    });
  } catch (e) {
    console.log('Error when guildMemberRemove %s', e);
  }
});

client.on('messageCreate', async () => {
  console.log('messageCreated');
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    if (interaction.commandName == 'next_month_circle') {
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
          monthCircle
            ? monthCircle.state == MonthCircleAnswerState.Retired
              ? '脱退'
              : monthCircle.state == MonthCircleAnswerState.Answered
              ? monthCircle.circle?.name
              : '未回答'
            : '未回答'
        }」です。変更は在籍希望アンケートのメッセージにリアクションで行ってください。`,
      });
    }
    if (interaction.commandName == 'register_trainer_id') {
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

      const trainerId = interaction.options.getString('trainer_id');
      if (!trainerId || !trainerId?.match(/^[0-9]+$/)) {
        interaction.editReply({
          content: 'トレーナーIDは数字で入力してください',
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
    }
  } catch (e) {
    console.log('Error when interactionCreate %s', e);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    console.log('messageReactionAdd %s %s', reaction, user);
    if (reaction.me) {
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
    if (!survey) {
      return;
    }

    await reaction.users.remove(user.id);

    const member = await prisma.member.findUnique({
      where: { id: user.id },
      include: {
        circle: true,
      },
    });

    if (!member) {
      return;
    }

    if (
      survey.expiredAt.getTime() <= Temporal.now.instant().epochMilliseconds
    ) {
      await user.send('在籍希望アンケートの期限が過ぎています。');
      return;
    }

    const { year, month } = survey;
    const { id: memberId, circleId } = member;

    if (!circleId) {
      await user.send('サークルに所属していません。');
      return;
    }

    if (emoji == Emojis.leave) {
      await prisma.monthCircle.upsert({
        where: {
          year_month_memberId: { year, month, memberId },
        },
        create: {
          year,
          month,
          memberId,
          circleId: null,
          currentCircleId: circleId,
          state: MonthCircleAnswerState.Retired,
        },
        update: {
          year,
          month,
          memberId,
          circleId: null,
          currentCircleId: circleId,
          state: MonthCircleAnswerState.Retired,
        },
      });
      await user.send(
        `${year}年${month}月の在籍希望アンケートを「脱退予定」で受け付けました。大変残念ですが、新天地での活躍をお祈りします。当サークルに在籍していただきありがとうございました :person_bowing:`
      );
    } else {
      const circle = await prisma.circle.findFirst({ where: { emoji } });
      if (!circle) {
        await user.send(
          '不明な絵文字です、在籍希望アンケートには決められた絵文字でリアクションしてください。'
        );
        return;
      }

      await prisma.monthCircle.upsert({
        where: {
          year_month_memberId: { year, month, memberId },
        },
        create: {
          year,
          month,
          memberId,
          circleId: circle.id,
          currentCircleId: circleId,
          state: MonthCircleAnswerState.Answered,
        },
        update: {
          year,
          month,
          memberId,
          circleId: circle.id,
          currentCircleId: circleId,
          state: MonthCircleAnswerState.Answered,
        },
      });

      if (circle.id == member.circle?.id) {
        await user.send(
          `${year}年${month}月の在籍希望アンケートを受け付けました。引き続き「${circle.name}」に所属とのことで手続きは以上となります。引き続きよろしくお願いします。`
        );
      } else if (member.trainerId) {
        await user.send(
          `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。トレーナーID入力済みですので、追加の手続きは必要ありません。月初にサークル勧誘と除名が行われますので、除名され次第希望のサークルからの勧誘を承諾して異動をお願いします。`
        );
      } else {
        await user.send(
          `${year}年${month}月の在籍希望アンケートを「${circle.name}」への異動で受け付けました。異動にはトレーナーIDの入力が必要です。ゲームのプロフィール画面の「IDコピー」を押してDiscordのサーバー上で \`/register_trainer_id\` と入力してトレーナーIDを登録してください。`
        );
      }
    }
  } catch (e) {
    console.log('Error when messageReactionAdd %s', e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
