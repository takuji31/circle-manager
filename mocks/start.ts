import { setupServer } from "msw/node";
import { logger } from "~/lib/logger";

import "~/utils";

const server = setupServer();

server.listen({ onUnhandledRequest: "bypass" });
logger.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
