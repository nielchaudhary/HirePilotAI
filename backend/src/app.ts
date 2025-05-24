import express from "express";
import { Logger } from "./utils/logger";
const app = express();

const logger = new Logger("app");

app.listen(8090, () => {
  logger.info("HirePilot AI LIVE ON PORT 8090");
});
