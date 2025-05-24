import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import {
  fetchOpenRouterChatCompletion,
  isNullOrUndefined,
} from "../utils/data-helpers";
import { isEmpty } from "lodash";
const logger = new Logger("completions");

export const streamChatCompletion = async (req: Request, res: Response) => {
  try {
    const { context } = req.body;

    if (isNullOrUndefined(context) || isEmpty(context)) {
      res.status(400).json({ error: "Missing context" });
      return;
    }

    const chatCompletion = await fetchOpenRouterChatCompletion(context);

    //TO-DO update it later as a streaming endpoint
    res.json(chatCompletion);
    return;
  } catch (error) {
    logger.error(
      `Could not fetch chat completion due to ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};
