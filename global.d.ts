declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly DISCORD_CLIENT_ID: string;
    readonly DISCORD_CLIENT_SECRET: string;
    readonly DISCORD_BOT_TOKEN: string;
    readonly BASE_URL: string;
    readonly REDIS_URL: string;
    readonly ADMIN_API_SECRET: string;
    readonly GOOGLE_API_KEY_JSON?: string;
    readonly GOOGLE_APPLICATION_CREDENTIALS?: string;
  }
}

interface BrowserEnv {
  NODE_ENV: "development" | "production" | "test";
}

interface Window {
  readonly ENV: BrowserEnv;
}
