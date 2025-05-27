import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import { isNullOrUndefined, IUserInfo } from "../utils/data";
import {
  generateSystemContent,
  validateRequest,
  processStreamResponse,
  setupResponseHeaders,
  prepareMessages,
  fetchOpenRouterResponse,
} from "../utils/api-helpers";

import dotenv from "dotenv";
dotenv.config();

const logger = new Logger("openai");

export const chatCompletionPostHandler = async (
  req: Request,
  res: Response
) => {
  try {
    logger.info("Received request for chat generation");

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (isNullOrUndefined(openRouterApiKey)) {
      throw new Error("OPENROUTER_API_KEY is not defined");
    }

    const { message, isInitialLoad, userInfo } = req.body as {
      message: string;
      isInitialLoad: boolean;
      userInfo?: IUserInfo;
    };

    setupResponseHeaders(res);

    const systemContent = generateSystemContent(
      isInitialLoad ? userInfo : undefined
    );
    const messages = prepareMessages(systemContent, message, isInitialLoad);

    const response = await fetchOpenRouterResponse(messages, openRouterApiKey);

    await processStreamResponse(response, res);
  } catch (error) {
    logger.error("Error in chatCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process completion" });
    }
  }
};
