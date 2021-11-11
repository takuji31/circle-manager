import { nextMonth } from './../model/year_month';
import { Guild } from './../model/guild';
import { prisma } from './../database/prisma';
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {
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
      circleId: {
        not: null,
      },
      monthCircles: {
        none: { ...month },
      },
    },
    ...(!isProduction ? { take: 10 } : {}),
  });
  const messages: Array<string> = [];
  const rest = createDiscordRestClient();
  members.forEach(async (member) => {
    let message: string = '';
    if (isProduction) {
      //TODO: DM
      let result = `${member.name} : `;
      try {
        let channelId = member.messageChannelId;
        if (!channelId) {
          const messsageChannel = (await rest.post(Routes.userChannels(), {
            body: {
              recipient_id: member.id,
            },
          })) as RESTPostAPICurrentUserCreateDMChannelResult;
          prisma.member.update({
            where: { id: member.id },
            data: { messageChannelId: messsageChannel.id },
          });
          channelId = messsageChannel.id;
        }
        rest.post(Routes.channelMessages(channelId), {});
        result += 'OK';
      } catch (e) {
        result += e.toString();
      }
    } else {
      message = `${member.name} : OK`;
    }
  });
})();
