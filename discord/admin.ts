import { RawFile } from "@discordjs/rest";
import { Guild } from "../model";
import { sendMessageToChannel } from "./message";

export async function sendAdminNotificationMessage(
  message: string,
  files: Array<RawFile> = []
) {
  await sendMessageToChannel({
    channelId: Guild.channelIds.admin,
    message,
    files,
  });
}
