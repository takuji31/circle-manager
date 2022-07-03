import { prisma } from "@/database";
import { createDiscordRestClient } from "@/discord";
import { Circle, DateFormats, Emoji, Guild, LocalDate, MonthSurveyEmoji, nextMonthInt } from "@/model";
import type { Member } from "@prisma/client";
import { MemberStatus } from "@prisma/client";
import type { RESTPostAPIWebhookWithTokenWaitResult } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import { MessageEmbed } from "discord.js";
import { config } from "dotenv";

config();

(async () => {
  const { year, month } = nextMonthInt();
  const expiredAt = LocalDate.firstDayOfNextMonth().withDayOfMonth(20).atStartOfDayJST();

  if (await prisma.monthSurvey.count({ where: { year, month } })) {
    throw new Error("Next month survey already started");
  }

  const rest = createDiscordRestClient();

  const embed = new MessageEmbed()
    .setTitle(`${year}年${month}月の在籍希望アンケート`)
    .setDescription(
      "来月の在籍希望に関するアンケートです。\n**来月も同じサークルに所属する場合も**必ずご回答ください！\n回答を受け付けたら結果がbotからメッセージで送られてくるので**必ず**、確認してください。",
    )
    .addField(
      "対象者",
      "このメッセージが送信された時点でサークルに所属しているメンバー/来月復帰予定のOB",
    )
    .addField(
      "対象外の方",
      "このメッセージが送信された時点で加入申請中のメンバー/来月復帰予定のないOB",
    )
    .addField(
      "期限",
      `${expiredAt.format(DateFormats.dateWithHour)}まで`,
    )
    .addField("回答方法", "このメッセージにリアクション");

  embed.addField("来月もサークルに所属する場合", Emoji.a);
  embed.addField("来月頭で脱退する場合", Emoji.b);
  embed.addField("来月頭で脱退するがDiscordに残留したい場合", Emoji.c);

  embed.addField("未回答の場合", "***除名となります。***");
  embed.addField("回答状態の確認方法", `このメッセージに:eyes:でリアクション`);

  const { id: messageId, channel_id: channelId } = (await rest.post(
    Routes.channelMessages(Guild.channelIds.all),
    {
      body: {
        content: process.env.NODE_ENV == "production" ? `<@&${Circle.shin.id}> <@&${Circle.ha.id}>` : ``,
        embeds: [embed],
      },
    },
  )) as RESTPostAPIWebhookWithTokenWaitResult;

  await prisma.monthSurvey.create({
    data: {
      id: messageId,
      year,
      month,
      expiredAt: expiredAt.toDate(),
    },
  });

  const members = await prisma.member.findMany({
    where: {
      circleKey: {
        not: null,
      },
      status: MemberStatus.Joined,
    },
  });

  await prisma.monthSurveyAnswer.createMany({
    data: members.map(({ id, circleKey }: Member) => ({
      memberId: id,
      circleKey: circleKey!!,
      year,
      month,
    })),
    skipDuplicates: true,
  });

  const emojiNames = [
    MonthSurveyEmoji.umamusume,
    MonthSurveyEmoji.leave,
    MonthSurveyEmoji.ob,
    Emoji.eyes,
  ];

  for (const emoji of emojiNames) {
    await rest.put(
      Routes.channelMessageOwnReaction(channelId, messageId, emoji),
    );
  }
})();
