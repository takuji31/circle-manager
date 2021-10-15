import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '@circle-manager/discord';
import { config } from 'dotenv';

config();

const commands = [
  new SlashCommandBuilder()
    .setName('month_survey_url')
    .setDescription('[開発中]来月の異動アンケートURLを発行します。'),
  new SlashCommandBuilder()
    .setName('month_survey_url')
    .setDescription('[開発中]来月の異動アンケートURLを発行します。'),
].map((command) => command.toJSON());

const rest = createDiscordRestClient();

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        process.env.DISCORD_GUILD_ID as string
      ),
      {
        body: commands,
      }
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();
