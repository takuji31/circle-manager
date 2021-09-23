import { PrismaClient } from "@prisma/client";
import { Client, Intents, TextChannel, User } from "discord.js";
import { Temporal } from "proposal-temporal";
import { config } from "dotenv";

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

// client.on("interactionCreate", async (interaction) => {
//   if (!interaction.isCommand()) return;
//   if (interaction.commandName == "update_members") {
//     await interaction.deferReply({ ephemeral: true });
//     try {
//       const guild = interaction.guild!!;
//       const roles = await guild.roles.fetch();
//       const members = await guild.members.fetch();
//       const circleMembers: Array<CircleMember> = members
//         .filter((member) => !member.user.bot)
//         .map((member) => {
//           const role = roles
//             .filter((r) => member.roles.cache.get(r.id) != null)
//             .filter((r) => ["@everyone", "幹部", "会長"].indexOf(r.name) < 0)
//             .first();
//           const joinedAt = member.joinedAt!!;
//           return {
//             nickname: member.nickname ?? member.user.username,
//             username: member.user.username + "#" + member.user.discriminator,
//             trainerId: "",
//             userId: member.user.id,
//             role: role?.name ?? "",
//             joinedAt: joinedAtFormatter.format(joinedAt),
//           };
//         });

//       const response = await createOrUpdateMember(circleMembers);
//       if (!response.ok) {
//         console.log(`Response error %s`, response);
//         throw Error(`HTTP Error ${response.status}`);
//       }

//       const json = await response.json();
//       if (json.error) {
//         console.log(`JSON error %s`, json);
//         throw Error(json.error);
//       }

//       if (!json.rows) {
//         console.log(`Bad response %s`, json);
//         throw Error(`Bad response ${json}`);
//       }
//       interaction.editReply({
//         content: "done",
//       });
//     } catch (e) {
//       console.log(e);
//       interaction.editReply({
//         content: e.message,
//       });
//     }
//   } else if (interaction.commandName == "update_member_circles_by_poll") {
//     await interaction.deferReply({ ephemeral: true });
//     try {
//       const guild = interaction.guild!!;
//       const pollId = interaction.options.getString("poll_id", true);
//       const channel: TextChannel =
//         (interaction.options.getChannel("channel") as TextChannel) ??
//         ((await guild.channels.fetch(CHANNEL_ID_BBS))!! as TextChannel);
//       const message = await channel.messages.fetch(pollId)!!;
//       const month = interaction.options.getString("month", true);

//       await guild.members.fetch();

//       const a = await message.reactions.resolve("🇦")?.users.fetch()!!;
//       const b = await message.reactions.resolve("🇧")?.users.fetch()!!;
//       const c = await message.reactions.resolve("🇨")?.users.fetch()!!;
//       const d = await message.reactions.resolve("🇩")?.users.fetch()!!;

//       await guild.roles.fetch();
//       const shin = guild.roles.cache.get(ROLE_ID_SHIN)?.name!!;
//       const jo = guild.roles.cache.get(ROLE_ID_JO)?.name!!;
//       const ha = guild.roles.cache.get(ROLE_ID_HA)?.name!!;

//       function notBot(user: User) {
//         return !user.bot;
//       }

//       let memberCircles: Array<MemberPollResult> = [];
//       memberCircles.push(
//         ...a.filter(notBot).map((user) => ({
//           result: shin,
//           userId: user.id,
//         })),
//         ...b.filter(notBot).map((user) => ({
//           result: ha,
//           userId: user.id,
//         })),
//         ...c.filter(notBot).map((user) => ({
//           result: jo,
//           userId: user.id,
//         })),
//         ...d.filter(notBot).map((user) => ({
//           result: "脱退",
//           userId: user.id,
//         }))
//       );

//       await updateMemberCircles(month, memberCircles);

//       await interaction.editReply({
//         content: "done",
//       });
//     } catch (e) {
//       interaction.editReply({
//         content: e.message,
//       });
//     }
//   }
// });

// client.on('interactionCreate', async interaction => {
//   if (!interaction.isCommand()) return;
//   if (interaction.commandName == 'update_members') {
//     try {
//       const guild = interaction.guild!!;
//       let pollId = interaction.options.getString('poll_id')!!;
//       let channel = (await guild.channels.fetch(
//         CHANNEL_ID_BBS
//       ))!! as TextChannel;
//       const message = await channel.messages.fetch(pollId)!!;

//       await guild.members.fetch();

//       const a = await message.reactions.resolve('🇦')?.users.fetch()!!;
//       const b = await message.reactions.resolve('🇧')?.users.fetch()!!;
//       const c = await message.reactions.resolve('🇨')?.users.fetch()!!;
//       const d = await message.reactions.resolve('🇩')?.users.fetch()!!;

//       function createRow(user: User): string {
//         let member = guild.members.cache.get(user.id)!!;
//         return [
//           member.nickname ?? member.user.username,
//           user.username + '#' + user.discriminator,
//         ].join(',');
//       }
//       function notPoll(user: User): boolean {
//         return user.username != 'Quick Poll';
//       }
//       const rows: [string] = [''];
//       rows.shift();
//       rows.push(...a.filter(notPoll).map(createRow));
//       rows.push(...b.filter(notPoll).map(createRow));
//       rows.push(...c.filter(notPoll).map(createRow));
//       rows.push(...d.filter(notPoll).map(createRow));

//       console.log(rows.join('\n'));

//       interaction.reply({
//         content: 'done',
//         ephemeral: true,
//       });
//     } catch (e) {
//       interaction.reply({
//         content: e.message,
//         ephemeral: true,
//       });
//     }
//   }
// });

client.login(process.env.DISCORD_BOT_TOKEN);
