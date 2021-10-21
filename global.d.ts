declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly DISCORD_CLIENT_ID: string;
    readonly DISCORD_CLIENT_SECRET: string;
    readonly DISCORD_BOT_TOKEN: string;
    readonly DISCORD_GUILD_ID: string;
    readonly CIRCLE_LEADER_ROLE_ID: string;
    readonly CIRCLE_SUB_LEADER_ROLE_ID: string;
    readonly BASE_URL: string;
    readonly DISCORD_MESSAGE_CHANNEL_ID: string;
  }
}
