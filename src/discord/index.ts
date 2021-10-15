import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export function createDiscordRestClient(
  accessToken: string = process.env.DISCORD_BOT_TOKEN as string
): REST {
  return new REST({ version: '9' }).setToken(accessToken);
}

export const sendBotNotificationMessage = (message: string) => {
  const rest = createDiscordRestClient();
  return rest.post(
    `${Routes.webhook(
      '897470834162155560',
      'i76bItNbaecp5Rn1J0vO4jAbb4RVMf32S4ZHWeu1BiAPwq_8X1CtnoHWXlyUg_kcef9G'
    )}?wait=true`,
    {
      body: {
        content: message,
      },
    }
  );
};
