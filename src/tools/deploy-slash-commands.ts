import { Guild } from './../model/guild';
import { prisma } from './../database/prisma';
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
    const circles = await prisma.circle.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const nextMonthCircleCommand = new SlashCommandBuilder()
      .setName('register-next-month-circle')
      .setDescription('[開発中]来月の在籍希望アンケートを先行して回答します');
    const circleOption = new SlashCommandStringOption()
      .setName('circle')
      .setRequired(true)
      .setDescription('所属したいサークル');

    circles.map((circle) => {
      circleOption.addChoice(circle.name, circle.id);
    });

    const commands = [
      new SlashCommandBuilder()
        .setName('next-month-circle')
        .setDescription('来月の在籍希望アンケートの回答を表示します。'),
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
      nextMonthCircleCommand.addStringOption(circleOption),
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
