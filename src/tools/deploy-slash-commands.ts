import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import { config } from 'dotenv';

config();

const commands = [
  new SlashCommandBuilder()
    .setName('next-month-circle')
    .setDescription('来月の在籍希望アンケートの回答を表示します。'),
  new SlashCommandBuilder()
    .setName('register-trainer-id')
    .setDescription('異動のために必要なトレーナーIDを登録します')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('id')
        .setRequired(true)
        .setDescription('トレーナーID')
    ),
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
