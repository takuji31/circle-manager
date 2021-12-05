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
    const embed = new MessageEmbed()
      .setTitle(`加入予定サークル選択`)
      .setDescription(
        'ウマ娘愛好会へようこそ。こちらでどのサークルに加入予定か選択してください。BotからDMでメッセージが送られてきたら成功です。回答を受け付けたらリアクションは消えます、ご注意ください。'
      )
      .addField(
        '対象者',
        '新規加入の方でまだサークルの勧誘が送られていない方。'
      )
      .addField('回答方法', 'このメッセージにリアクション');

    const circles = await prisma.circle.findMany({
      where: { selectableByUser: true },
      orderBy: { order: 'asc' },
    });
    circles.forEach((circle) => {
      embed.addField(`${circle.name} 希望の場合`, `${circle.emoji}`);
    });

    const { id: messageId, channel_id: channelId } = (await rest.post(
      Routes.channelMessages(Guild.channelIds.circleSelect),
      {
        body: {
          embeds: [embed],
        },
      }
    )) as RESTPostAPIChannelMessageResult;

    const emojiNames = circles.map((circle) => circle.emoji);
    emojiNames.forEach(async (emoji) => {
      if (emoji) {
        await rest.put(
          Routes.channelMessageOwnReaction(channelId, messageId, `${emoji}`)
        );
      }
    });

    console.log('MessageID: %s', messageId);
  } catch (error) {
    console.error(error);
  }
})();
