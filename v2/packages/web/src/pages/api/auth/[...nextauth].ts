import {
  RESTGetAPICurrentUserGuildsResult,
  Routes,
} from 'discord-api-types/v9';
import { createDiscordRestClient } from '../../../discord';
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { Guild } from '../../../model/guild';
import { Permissions } from 'discord.js';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization:
        'https://discord.com/api/oauth2/authorize?scope=identify+email+guilds',
    }),
  ],
  secret: process.env.SECRET,
  session: {
    strategy: 'jwt',
  },
  debug: true,
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return baseUrl + url;
      } else if (url.startsWith(baseUrl)) {
        return url;
      } else {
        return baseUrl;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        const accessToken = account.access_token as string;
        token.accessToken = accessToken;
        const rest = createDiscordRestClient(accessToken);
        const guilds = (await rest.get(Routes.userGuilds(), {
          authPrefix: 'Bearer',
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
        token.id = account.providerAccountId;
        token.isMember = isMember;
        token.isAdmin = isAdmin;
        // console.log("create new JWT %s %s", token, account);
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.id = token.id;
      session.accessToken = token.accessToken;
      session.name = token.name ?? '';
      session.isMember = token.isMember;
      session.isAdmin = token.isAdmin;
      // console.log("session %s token: %s", session, token);
      return session;
    },
  },
});
