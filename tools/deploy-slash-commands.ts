import { Guild } from '@circle-manager/shared/model';
import {
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '@circle-manager/shared/discord';
import { config } from 'dotenv';
import { Circles } from '@circle-manager/shared/model';
import { RESTPutAPIApplicationGuildCommandsResult } from 'discord-api-types';
import { RESTPutAPIChannelPermissionJSONBody } from 'discord-api-types';
import { OverwriteType } from 'discord-api-types';
import { RESTPutAPIApplicationGuildCommandsJSONBody } from 'discord-api-types';
import { RESTPutAPIApplicationCommandPermissionsResult } from 'discord-api-types';
import { RESTPutAPIApplicationCommandPermissionsJSONBody } from 'discord-api-types';
import { ApplicationCommandPermissionType } from 'discord-api-types';

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
      new SlashCommandBuilder()
        .setName('update-fan-count')
        .addStringOption(
          new SlashCommandStringOption()
            .addChoices(
              ...Circles.activeCircles.map((circle) => {
                return {
                  name: circle.name,
                  value: circle.key,
                };
              })
            )
            .setName('circle')
            .setRequired(true)
            .setDescription('対象のサークル')
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName('year')
            .setRequired(false)
            .setDescription('年、指定しない場合は今年')
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName('month')
            .setRequired(false)
            .setDescription('月、指定しない場合は今月')
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName('day')
            .setRequired(false)
            .setDescription('日、指定しない場合は昨日')
        )
        .setDefaultPermission(false)
        .setDescription('(運営メンバー専用)ファン数更新をトリガーします。'),
    ].map((command) => command.toJSON());

    const rest = createDiscordRestClient();

    const createResponse = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        Guild.id
      ),
      {
        body: commands,
      }
    )) as RESTPutAPIApplicationGuildCommandsResult;

    const adminCommands = createResponse.filter(
      (command) => command.name == 'update-fan-count'
    );

    for (const adminCommand of adminCommands) {
      const body: RESTPutAPIApplicationCommandPermissionsJSONBody = {
        permissions: [
          {
            id: Guild.roleIds.administrators,
            permission: true,
            type: 1 as ApplicationCommandPermissionType,
          },
        ],
      };
      await rest.put(
        Routes.applicationCommandPermissions(
          process.env.DISCORD_CLIENT_ID as string,
          Guild.id,
          adminCommand.id
        ),
        {
          body,
        }
      );
    }

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
})();