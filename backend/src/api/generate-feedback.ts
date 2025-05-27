import { generateCompletionUsingAI } from "../utils/api-helpers";
import { IMessage, isNullOrUndefined, ROLE } from "../utils/data";
import { Logger } from "../utils/logger";
import { Request, Response } from "express";
import { IUserFeedback } from "../utils/data";

const logger = new Logger("generate-feedback");

export const generateFeedbackPostHandler = async (
  req: Request,
  res: Response
) => {
  logger.info("Generating Feedback for the Interview");

  try {
    const { messages } = req.body as { messages: IMessage[] };

    if (isNullOrUndefined(messages)) {
      res.status(400).send("Missing messages");
      return;
    }

    // filter out empty or thinking messages
    const relevantMessages = messages.filter(
      (m) =>
        m.content &&
        m.content.trim() !== "" &&
        m.content !== "Thinking..." &&
        m.content !== "..."
    );

    const generateFeedback = await generateCompletionUsingAI(
      "",
      true,
      relevantMessages
    );

    if (isNullOrUndefined(generateFeedback)) {
      logger.error("AI returned empty response");
      res.status(500).send("Failed to generate feedback");
      return;
    }

    let parsedFeedback: IUserFeedback;
    try {
      parsedFeedback = JSON.parse(generateFeedback);
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON:", {
        error: parseError,
        response: generateFeedback,
      });
      return;
    }

    const { feedback, strengths, weaknesses } = parsedFeedback;

    if (!feedback && !strengths && !weaknesses) {
      logger.error(
        "Parsed feedback is missing all required fields:",
        parsedFeedback
      );
    }

    res.status(200).send({ feedback, strengths, weaknesses });
  } catch (error) {
    logger.error("Error in generating feedback", error);
    res.status(500).send("Failed to generate feedback");
  }
};
