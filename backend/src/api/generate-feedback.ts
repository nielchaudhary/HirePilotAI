import { generateCompletionUsingAI } from "../utils/api-helpers";
import { IMessage, isNullOrUndefined } from "../utils/data";
import { Logger } from "../utils/logger";
import { Request, Response } from "express";

const logger = new Logger("generate-feedback");

const generateFeedback = async (messages: IMessage[]) => {
  const interviewFeedback = await generateCompletionUsingAI("", true, [
    { messages },
  ]);
};

export const generateFeedbackPostHandler = async (
  req: Request,
  res: Response
) => {
  logger.info("Generating Feedback for the Interview : ");

  try {
    const { messages } = req.body as { messages: IMessage[] };

    if (isNullOrUndefined(messages)) {
      res.status(400).json({ error: "Missing messages" });
      return;
    }

    const feedback = await generateFeedback(messages);
    res.status(200).json({ feedback });
  } catch (error) {
    logger.error("Error in generating feedback", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
};
