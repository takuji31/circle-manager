import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { DiscordStrategy } from "remix-auth-discord";
import type { SessionUser } from "@circle-manager/shared/model";
import { CircleRole } from "@prisma/client";
import invariant from "tiny-invariant";

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
      return {
        id: profile.id,
        name: profile.displayName,
        role: CircleRole.Member,
        isAdmin: false,
        isMember: false,
        circleKey: null,
        profileImageUrl,
      };
    }
  ),
  "discord"
);
