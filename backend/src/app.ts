import express from "express";
import { Logger } from "./utils/logger";
import { chatRouter } from "./router";
const app = express();

const logger = new Logger("app");

const initServer = async (): Promise<void> => {
  logger.info("Initializing server...");
  app.use(express.json());
  app.use(chatRouter[0], chatRouter[1]);

  logger.info("HirePilot AI Server Processes Initialized Successfully");
};

(async function startServer() {
  try {
    await initServer();
  } catch (error) {
    logger.error(`Failed to start server due to ${error}`);
    process.exit(1);
  }
})().then(() => {
  app.listen(8090, () => {
    logger.info("HirePilot AI Server Live On Port 8090");
  });
});
