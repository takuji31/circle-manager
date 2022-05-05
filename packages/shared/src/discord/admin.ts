import { RawFile } from "@discordjs/rest";
import {
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from "discord-api-types/rest/v9";
import { createDiscordRestClient } from ".";
import { Guild } from "../model";

export async function sendAdminNotificationMessage(
  message: string,
  files: Array<RawFile> = []
) {
  const rest = createDiscordRestClient();
  const body: RESTPostAPIChannelMessageJSONBody = {
    content: message,
  };
  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: body,
    files,
  });
}
