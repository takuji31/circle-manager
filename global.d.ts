declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly DISCORD_CLIENT_ID: string;
    readonly DISCORD_CLIENT_SECRET: string;
    readonly DISCORD_BOT_TOKEN: string;
    readonly BASE_URL: string;
  }
}
