import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { DiscordStrategy } from "remix-auth-discord";
import { Guild, SessionUser } from "@/model";
import { createDiscordRestClient } from "@/discord";
import invariant from "tiny-invariant";
import { prisma } from "./db.server";
import {
  RESTGetAPICurrentUserGuildsResult,
  Routes,
} from "discord-api-types/rest/v9";
import { Permissions } from "discord.js";

invariant(process.env.BASE_URL, "BASE_URL must be set");
invariant(process.env.DISCORD_CLIENT_ID, "DISCORD_CLIENT_ID must be set");
invariant(
  process.env.DISCORD_CLIENT_SECRET,
  "DISCORD_CLIENT_SECRET must be set"
);

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<SessionUser>(sessionStorage);

authenticator.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + "/api/auth/callback/discord",
      scope: ["identify", "email", "guilds"],
    },
    async ({ accessToken, refreshToken, extraParams, profile, context }) => {
      console.log(profile);
      const avatarHash = profile.__json.avatar;
      const profileImageUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatarHash}.png`
        : null;
      const member = await prisma.member.findFirst({
        where: { id: profile.id },
      });

      const rest = createDiscordRestClient(accessToken);
      const guilds = (await rest.get(Routes.userGuilds(), {
        authPrefix: "Bearer",
      })) as RESTGetAPICurrentUserGuildsResult;
      const guild = guilds.filter((guild) => guild.id == Guild.id)[0];
      const isMember = guild != null;
      const permissions = guild?.permissions;
      const isAdmin =
        permissions != null
          ? new Permissions(BigInt(permissions)).has(
              Permissions.FLAGS.ADMINISTRATOR
            )
          : false;

      return {
        id: profile.id,
        name: profile.displayName,
        role: member?.circleRole ?? null,
        isAdmin,
        isMember,
        circleKey: member?.circleKey ?? null,
        profileImageUrl,
      };
    }
  ),
  "discord"
);
