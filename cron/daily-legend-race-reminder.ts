import { config } from 'dotenv';
import { Guild } from '@/model';
import { createDiscordRestClient } from '@/discord';
import {
  AllowedMentionsTypes,
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord-api-types/v9';

config();

(async () => {
  const rest = createDiscordRestClient();

  const body: RESTPostAPIChannelMessageJSONBody = {
    content: `デイリーレジェンドレースやった？`,
    allowed_mentions: {
      parse: ['everyone' as AllowedMentionsTypes],
    },
  };
  await rest.post(Routes.channelMessages(Guild.channelIds.random), { body });
})();
