import { Guild } from './../model/guild';
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';

config();

(async () => {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName('register-trainer-id')
        .setDescription('トレーナーIDを登録します。')
        .addStringOption(
          new SlashCommandStringOption()
            .setName('id')
            .setRequired(true)
            .setDescription('トレーナーID')
        ),
      new SlashCommandBuilder()
        .setName('trainer-id')
        .setDescription('登録されているあなたのトレーナーIDを表示します。'),
    ].map((command) => command.toJSON());

    const rest = createDiscordRestClient();

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        Guild.id
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
