import { REST } from "@discordjs/rest";

export function createDiscordRestClient(
  accessToken: string = process.env.DISCORD_BOT_TOKEN as string
): REST {
  return new REST({ version: "9" }).setToken(accessToken);
}
