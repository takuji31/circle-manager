import { createClient } from "redis";
import { logger } from "~/lib/logger";

export type RedisClient = ReturnType<typeof createRedisClient> extends Promise<infer T>
  ? T
  : never;

export const createRedisClient = async () => {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => logger.error("Redis Client Error", err));

  await client.connect();
  return client;
};

export const RedisKeys = {
  personalChannelMessageId: "personal_channnel_message_id",
} as const;
