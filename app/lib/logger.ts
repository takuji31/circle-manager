import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV == "development" || (typeof window !== "undefined" && window.ENV.NODE_ENV == "development") ? "debug" : "info",
});
