import { createDiscordRestClient } from "@/discord";
import { config } from "dotenv";
import { createRedisClient, RedisKeys } from "@/lib/redis";
import type {
  APIMessage,
  RESTGetAPIChannelMessageResult,
  RESTPatchAPIChannelMessageResult,
  RESTPostAPIChannelMessageResult,
} from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import { Guild } from "@/model";
import { MessageEmbed } from "discord.js";
import { Emoji } from "@/model";

config();

(async () => {
  try {
    const redis = await createRedisClient();
    const rest = createDiscordRestClient();

    const existingMessageId = await redis.get(
      RedisKeys.personalChannelMessageId
    );

    let message: APIMessage | undefined = undefined;
    if (existingMessageId) {
      try {
        const existingMessage = (await rest.get(
          Routes.channelMessage(
            Guild.channelIds.channelSettings,
            existingMessageId
          )
        )) as RESTGetAPIChannelMessageResult;
        message = existingMessage;
      } catch (e) {}
    }

    const embed = new MessageEmbed()
      .setTitle(`個人チャンネルの開設`)
      .setDescription(
        "個人チャンネルの開設ができます。\n絵文字でリアクションすることですぐにチャンネルが作成されます。\n複数回押したりチェックを外したりしてもチャンネルは1つしか作成されません。"
      )
      .addField(
        "開設方法",
        "このメッセージに:pencil2:でリアクションすると開設されます。"
      )
      .addField(
        "閉鎖方法",
        "今のところありません、どうしても消したい方は運営メンバーまで連絡してください。"
      );

    if (message) {
      message = (await rest.patch(
        Routes.channelMessage(Guild.channelIds.channelSettings, message.id),
        {
          body: {
            embeds: [embed.toJSON()],
          },
        }
      )) as RESTPatchAPIChannelMessageResult;
    } else {
      message = (await rest.post(
        Routes.channelMessages(Guild.channelIds.channelSettings),
        {
          body: {
            embeds: [embed.toJSON()],
          },
        }
      )) as RESTPostAPIChannelMessageResult;
    }

    await rest.put(
      Routes.channelMessageOwnReaction(
        Guild.channelIds.channelSettings,
        message.id,
        Emoji.pen
      )
    );

    await redis.set(RedisKeys.personalChannelMessageId, message.id);

    console.log("Message create or updated %s", message);

    await redis.disconnect();
  } catch (error) {
    console.error(error);
  }
})();
