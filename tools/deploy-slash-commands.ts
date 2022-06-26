import { createDiscordRestClient } from "@/discord";
import { Guild } from "@/model";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import type {
  ApplicationCommandPermissionType,
  RESTPutAPIApplicationCommandPermissionsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
} from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";
import { logger } from "~/lib/logger";

config();

(async () => {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName("register-trainer-id")
        .setDescription("トレーナーIDを登録します。")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("id")
            .setRequired(true)
            .setDescription("トレーナーID"),
        ),
      new SlashCommandBuilder()
        .setName("trainer-id")
        .setDescription("登録されているあなたのトレーナーIDを表示します。"),
    ].map((command) => command.toJSON());

    const rest = createDiscordRestClient();

    const createResponse = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID as string,
        Guild.id,
      ),
      {
        body: commands,
      },
    )) as RESTPutAPIApplicationGuildCommandsResult;

    const adminCommands = createResponse.filter(
      (command) => command.name == "update-fan-count",
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
          adminCommand.id,
        ),
        {
          body,
        },
      );
    }

    logger.info("Successfully registered application commands.");
  } catch (error) {
    logger.error(error);
  }
})();
