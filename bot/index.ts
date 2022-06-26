import { updateMemberRoleEvent } from "@/bot/member/update_member_role";
import { sendWelcomeMessage } from "@/discord";
import type { RedisClient } from "@/lib/redis";
import { createRedisClient, RedisKeys } from "@/lib/redis";
import { Emoji, MonthSurveyEmoji } from "@/model";
import { CircleRole, PrismaClient } from "@prisma/client";
import { Client, Intents, Options } from "discord.js";
import { config } from "dotenv";
import { logger } from "~/lib/logger";
import { createPersonalChannel } from "./member/create_personal_channes";
import { trainerIdCommand } from "./member/trainer_id";
import { updateMemberNicknameEvent } from "./member/update_member_nickname";
import { monthSurveyReaction, monthSurveyShowReaction } from "./month_survey";
import { registerTrainerIdCommand } from "./register_trainer_id";

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
  logger.debug("guildUpdate %s", guild);
});

client.on("ready", async () => {
  redis = await createRedisClient();
  logger.info("ready");
});

client.on("guildMemberRemove", async (member) => {
  logger.debug("Member removed %s", member);
  try {
    await prisma.member.update({
      where: { id: member.id },
      data: {
        circleKey: null,
        // 本来はメンバーではないが、一番下位のロールがメンバーなのでメンバーということにしている。
        circleRole: CircleRole.Member,
        leavedAt: new Date(),
      },
    });
  } catch (e) {
    logger.warn("Error when guildMemberRemove %s", e);
  }
});

client.on("guildMemberAdd", async (member) => {
  logger.debug("Member added %s", member);
  if (member.user.bot) {
    return;
  }
  try {
    // 加入申請の登録時に必須の情報は入力されているはずなので、最低限の情報だけ更新する
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
    if (process.env.NODE_ENV != "production") return;
    await sendWelcomeMessage(createdMember);
  } catch (e) {
    logger.warn("Error when guildMemberRemove %s", e);
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  await updateMemberNicknameEvent(oldMember, newMember);
  await updateMemberRoleEvent(oldMember, newMember);
});

client.on("messageCreate", async (message) => {
  logger.trace("messageCreated %o", message);
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
  } catch (e) {
    logger.warn("Error when interactionCreate %s", e);
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
          reaction.message.guild!,
        );
      }
    }
  } catch (e) {
    logger.warn("Error when messageReactionAdd %s", e);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
