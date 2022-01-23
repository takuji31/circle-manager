import { Guild } from './../../model/guild';
import { Message } from 'discord.js';
import { Circle } from '../../model';
import { Temporal } from 'proposal-temporal';
import { crawlUmastagram } from '../../umastagram/crawler';

const urlPattern =
  /https:\/\/umastagram.com\/circle\/grade\/graph\/share\/[a-zA-Z0-9]+/;

export const updateFanCountEvent = async (message: Message, circle: Circle) => {
  if (!message.content.match(/(更新|集計)しました/)) {
    return;
  }

  const adminChannel = message.client.channels.cache.get(
    Guild.channelIds.admin
  );
  if (!adminChannel || !adminChannel.isText()) {
    throw new Error(`Admin Channel not found ${Guild.channelIds.admin}`);
  }

  let notificationMessage = `ファン数の更新が検知されました <#${message.channel.id}>`;
  const notification = await adminChannel.send(notificationMessage);

  const result = urlPattern.exec(message.content);
  let umastagramUrl: string;
  if (result) {
    umastagramUrl = result[0];
    console.log(
      'Found Umastagram URL in notification message %s',
      umastagramUrl
    );
  } else {
    try {
      const pastMessages = await message.channel.messages.fetch({
        before: message.id,
        limit: 100,
      });
      const today = Temporal.now.plainDate('iso8601', 'Asia/Tokyo');
      const umastagramUrlMessage = pastMessages.find((msg) => {
        return (
          urlPattern.test(msg.content) &&
          today.year == msg.createdAt.getFullYear() &&
          today.month == msg.createdAt.getMonth() + 1
        );
      });
      if (!umastagramUrlMessage) {
        throw new Error('UmastagramのURLが直近100件のメッセージにありません。');
      }
      umastagramUrl = (urlPattern.exec(umastagramUrlMessage.content) ?? [])[0];
      console.log(
        'Found Umastagram URL in past message %s',
        umastagramUrlMessage
      );
    } catch (e) {
      await notification.edit(
        notificationMessage +
          `\n\n` +
          `UmastagramのURLを発見できませんでした。エラー↓\n` +
          '```' +
          `${e}`.substring(0, 1800) +
          '\n```'
      );
      return;
    }
  }

  notificationMessage =
    notificationMessage +
    `\n\n` +
    'UmastagramのURLを発見しました... `' +
    umastagramUrl +
    '`\n';
  await notification.edit(notificationMessage);

  try {
    await crawlUmastagram(umastagramUrl, circle);
  } catch (e) {}
};