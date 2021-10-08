import { nextMonth } from "./../date/year_month";
import { PrismaClient, MonthCircleAnswerState } from "@prisma/client";
import { Client, Intents, TextChannel, User } from "discord.js";
import { Temporal } from "proposal-temporal";
import { config } from "dotenv";
import { thisMonth } from "../date/year_month";

config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

const calendar = Temporal.Calendar.from("iso8601");
const timeZone = Temporal.TimeZone.from("Asia/Tokyo");
const joinedAtFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

const prisma = new PrismaClient();

client.on("guildCreate", async (guild) => {});

client.on("guildUpdate", async (guild) => {
  console.log("guildUpdate %s", guild);
});

client.on("ready", async () => {
  console.log("ready");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName == "month_survey_url") {
    await interaction.deferReply({ ephemeral: true });
    const memberId = interaction.user.id;
    const month = nextMonth();

    const monthCircle = await prisma.monthCircle.upsert({
      where: {
        year_month_memberId: {
          ...month,
          memberId,
        },
      },
      create: {
        memberId,
        ...month,
        state: MonthCircleAnswerState.NoAnswer,
      },
      update: {},
    });

    interaction.editReply({
      content: `${process.env.BASE_URL}/month_circles/${monthCircle.id}`,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
