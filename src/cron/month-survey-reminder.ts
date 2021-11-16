import { Guild } from './../model/guild';
import { Circles } from './../model/circle';
import { nextMonth } from './../model/year_month';
import { prisma } from './../database/prisma';
import {
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
} from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';

config();

(async () => {
  const isProduction = process.env.NODE_ENV == 'production';
  const month = nextMonth();
  const members = await prisma.member.findMany({
    where: {
      circle: {
        is: {
          selectableByUser: true,
        },
      },
      leavedAt: null,
      OR: [
        {
          monthCircles: {
            none: { ...month },
          },
        },
        {
          monthCircles: {
            some: {
              ...month,
              circleId: Circles.specialIds.noAnswer,
            },
          },
        },
      ],
    },
  });
  const messages: Array<string> = [];
  const rest = createDiscordRestClient();
  console.log('members: %s', members);
  for await (const member of members) {
    let message: string = '';
    let result = `${member.name} : `;
    try {
      let channelId = member.messageChannelId;
      if (!channelId) {
        const messsageChannel = (await rest.post(Routes.userChannels(), {
          body: {
            recipient_id: member.id,
          },
        })) as RESTPostAPICurrentUserCreateDMChannelResult;
        await prisma.member.update({
          where: { id: member.id },
          data: { messageChannelId: messsageChannel.id },
        });
        channelId = messsageChannel.id;
      }
      result += 'OK';
      //TODO: DM
      if (isProduction) {
        // await rest.post(Routes.channelMessages(channelId), {});
      }
    } catch (e) {
      console.log(e);
      result += `${e}`;
    }
    messages.push(result);
  }
  console.log(messages);
  const body: RESTPostAPIChannelMessageJSONBody = {
    content: (
      `在籍希望アンケートの未回答者へのリマインダー送信結果 ${
        !isProduction ? '(テスト用のため未送信)' : ''
      }\n    ` + messages.join('\n    ')
    ).trim(),
  };
  const result = await rest.post(
    Routes.channelMessages(Guild.channelIds.admin),
    {
      body,
    }
  );
})();
