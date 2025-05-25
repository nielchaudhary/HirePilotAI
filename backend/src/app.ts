import express from "express";
import { Logger } from "./utils/logger";
import { chatRouter } from "./router";
import fileUpload from "express-fileupload";
import cors from "cors";
const app = express();

const logger = new Logger("app");

const initServer = async (): Promise<void> => {
  logger.info("Initializing server...");
  app.use(express.json());
  app.use(cors());
  app.use(
    fileUpload({
      createParentPath: true,
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5MB limit
      },
    })
  );
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
