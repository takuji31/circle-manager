import { Guild } from './../model/guild';
import { PrismaPromise } from '.prisma/client';
import { stringify } from 'csv-stringify/sync';
import {
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
} from 'discord-api-types/rest/v9';
import { createDiscordRestClient } from '.';
import { prisma } from 'database';

export interface DirectMessageRecipient {
  id: string;
  messageChannelId?: string | null;
  name: string;
}

class DMSendResult {
  succeed: boolean = true;
  content: string = '';
  private _error: any | null = null;

  public get error(): any | null {
    return this._error;
  }
  public set error(v: any) {
    this._error = v;
    this.succeed = false;
  }

  constructor(private recipient: string) {}

  toCsvArray(): Array<string> {
    return [
      this.recipient,
      this.succeed ? 'OK' : 'error',
      this.content,
      this.error ? `${this.error}` : '',
    ];
  }
}

export async function sendDirectMessageIfPossible<
  T extends DirectMessageRecipient = DirectMessageRecipient
>(
  recipent: T,
  content: string,
  force: boolean = process.env.NODE_ENV == 'production'
) {
  const rest = createDiscordRestClient();
  try {
    let channelId = recipent.messageChannelId;
    if (!channelId) {
      const messsageChannel = (await rest.post(Routes.userChannels(), {
        body: {
          recipient_id: recipent.id,
        },
      })) as RESTPostAPICurrentUserCreateDMChannelResult;
      await prisma.member.update({
        where: { id: recipent.id },
        data: { messageChannelId: messsageChannel.id },
      });
      channelId = messsageChannel.id;
    }
    if (force) {
      const body: RESTPostAPIChannelMessageJSONBody = {
        content,
      };
      await rest.post(Routes.channelMessages(channelId), {
        body: body,
      });
    } else {
      const body: RESTPostAPIChannelMessageJSONBody = {
        content:
          '`' +
          recipent.name +
          '`' +
          'さんへのDM送信(テストのため実際には送信されません)。内容\n```\n' +
          content +
          '\n```',
      };
      await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
        body: body,
      });
    }
  } catch (e) {
    console.log(e);
    const body: RESTPostAPIChannelMessageJSONBody = {
      content:
        recipent.name +
        'さんへのDM送信に失敗しました。エラー内容\n```\n' +
        e +
        '\n```',
    };
    await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
      body: body,
    });
  }
}

export async function sendDirectMessagesIfPossible<
  T extends DirectMessageRecipient = DirectMessageRecipient
>(
  recipents: Array<T>,
  contentProducer: (recipient: T) => string,
  reportMessage: string,
  force: boolean = process.env.NODE_ENV == 'production'
) {
  const rest = createDiscordRestClient();
  const result: Array<Array<string>> = [
    ['宛先', '送信結果', '送信内容', 'エラー'],
  ];
  const transactions: Array<PrismaPromise<any>> = [];
  for await (const recipent of recipents) {
    let sendResult = new DMSendResult(recipent.name);
    try {
      let channelId = recipent.messageChannelId;
      if (!channelId) {
        const messsageChannel = (await rest.post(Routes.userChannels(), {
          body: {
            recipient_id: recipent.id,
          },
        })) as RESTPostAPICurrentUserCreateDMChannelResult;
        transactions.push(
          prisma.member.update({
            where: { id: recipent.id },
            data: { messageChannelId: messsageChannel.id },
          })
        );
        channelId = messsageChannel.id;
      }
      const content = contentProducer(recipent);
      sendResult.content = content;
      if (force) {
        const body: RESTPostAPIChannelMessageJSONBody = {
          content,
        };
        await rest.post(Routes.channelMessages(channelId), {
          body: body,
        });
      }
    } catch (e) {
      console.log(e);
      sendResult.error = e;
    }
    result.push(sendResult.toCsvArray());
  }
  const csv = stringify(result);

  await prisma.$transaction(transactions);

  const body: RESTPostAPIChannelMessageJSONBody = {
    content: reportMessage,
  };
  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: body,
    attachments: [
      {
        fileName: 'result.csv',
        rawBuffer: Buffer.from(csv, 'utf-8'),
      },
    ],
  });
}
