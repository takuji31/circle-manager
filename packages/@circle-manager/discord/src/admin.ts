import { RawAttachment } from '@discordjs/rest';
import {
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord-api-types/rest/v9';
import { createDiscordRestClient } from '.';
import { Guild } from 'model';

export async function sendAdminNotificationMessage(
  message: string,
  attachments: Array<RawAttachment>
) {
  const rest = createDiscordRestClient();
  const body: RESTPostAPIChannelMessageJSONBody = {
    content: message,
  };
  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: body,
    attachments: attachments,
  });
}
