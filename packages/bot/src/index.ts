import { sendSetupMessage } from "../discord/member/messages";
import { trainerIdCommand } from "./member/trainer_id";
import { updateMemberNicknameEvent } from "./member/update_member_nickname";
import { monthSurveyReaction, monthSurveyShowReaction } from "./month_survey";
import { registerTrainerIdCommand } from "./register_trainer_id";
import { PrismaClient } from "@prisma/client";
import { Client, Intents, Options } from "discord.js";
import { config } from "dotenv";
import { Emoji, MonthSurveyEmoji, Circles, isCircleKey } from "model";
import {
  updateFanCountEvent,
  updateFanCountFromChannel,
} from "./circle/update_fan_count";
import {
  createRedisClient,
  RedisClient,
  RedisKeys,
} from "@circle-manager/redis";
import { createPersonalChannel } from "./member/create_personal_channes";

config();

const client = new Client({
  partials: ["MESSAGE", "REACTION", "CHANNEL", "USER", "GUILD_MEMBER"],
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

let redis: RedisClient;

client.on("guildUpdate", async (guild) => {
  console.log("guildUpdate %s", guild);
});

client.on("ready", async () => {
  redis = await createRedisClient();
  console.log("ready");
});

client.on("guildMemberRemove", async (member) => {
  console.log("Member removed %s", member);
  try {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        circleKey: null,
        leavedAt: new Date(),
      },
    });
  } catch (e) {
    console.log("Error when guildMemberRemove %s", e);
  }
});

client.on("guildMemberAdd", async (member) => {
  console.log("Member added %s", member);
  if (member.user.bot) {
    return;
  }
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
    await prisma.signUp.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
      },
      // renew si
      update: {
        circleKey: null,
        createdAt: new Date(),
        invited: false,
        joined: false,
      },
    });
    if (process.env.NODE_ENV != "production") return;
    await sendSetupMessage(createdMember);
  } catch (e) {
    console.log("Error when guildMemberRemove %s", e);
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  await updateMemberNicknameEvent(oldMember, newMember);
});

client.on("messageCreate", async (message) => {
  console.log("messageCreated");
  const notificationCircle = Circles.findByRawNotificationChannelId(
    message.channel.id
  );
  if (notificationCircle) {
    updateFanCountEvent(message, notificationCircle);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    if (interaction.commandName == "register-trainer-id") {
      await registerTrainerIdCommand(interaction);
    }
    if (interaction.commandName == "trainer-id") {
      await trainerIdCommand(interaction);
    }
    if (interaction.commandName == "update-fan-count") {
      const circleKey = interaction.options.getString("circle");
      if (!circleKey || !isCircleKey(circleKey)) {
        interaction.reply({ content: `不明なサークルキーです ${circleKey}` });
        return;
      }

      const circle = Circles.findByCircleKey(circleKey);
      const notificationChannel = interaction.guild?.channels.resolve(
        circle.notificationChannelId
      );
      if (
        !notificationChannel ||
        !notificationChannel?.isText() ||
        notificationChannel.type != "GUILD_TEXT"
      ) {
        interaction.reply({
          content: `不明なチャンネル: ${circle.notificationChannelId}`,
        });
        return;
      }

      const year = interaction.options.getInteger("year", false);
      const month = interaction.options.getInteger("year", false);
      const day = interaction.options.getInteger("year", false);

      interaction.reply({
        content: "ファン数取得を開始します",
        ephemeral: true,
      });

      await updateFanCountFromChannel({
        circle,
        notificationChannel,
        year,
        month,
        day,
      });

      interaction.editReply({ content: "ファン数取得完了しました" });
    }
  } catch (e) {
    console.log("Error when interactionCreate %s", e);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  try {
    if (user.bot) {
      return;
    }
    const emoji = reaction.emoji.name;
    if (!emoji) {
      return;
    }

    if (
      Object.values(MonthSurveyEmoji).includes(emoji as any) ||
      emoji == Emoji.eyes
    ) {
      const survey = await prisma.monthSurvey.findUnique({
        where: {
          id: reaction.message.id,
        },
      });
      if (survey && emoji == Emoji.eyes) {
        monthSurveyShowReaction(reaction, user, emoji, survey);
        return;
      } else if (survey) {
        monthSurveyReaction(reaction, user, emoji, survey);
        return;
      }
    }

    if (emoji == Emoji.pen) {
      const messageId = await redis.get(RedisKeys.personalChannelMessageId);
      if (reaction.message.id == messageId) {
        await createPersonalChannel(
          reaction,
          user,
          emoji,
          reaction.message.guild!
        );
      }
    }
  } catch (e) {
    console.log("Error when messageReactionAdd %s", e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
