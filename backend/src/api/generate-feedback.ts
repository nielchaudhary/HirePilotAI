import { isNullOrUndefined } from "../utils/data";
import { Logger } from "../utils/logger";
import { Request, Response } from "express";

const logger = new Logger("generate-feedback");

export const generateFeedbackPostHandler = async (
  req: Request,
  res: Response
) => {
  logger.info("Generating Feedback for the Interview : ");

  try {
    const { interviewId } = req.body as { interviewId: string };

    if (isNullOrUndefined(interviewId)) {
      res.status(400).json({ error: "Missing interviewId" });
      return;
    }
  } catch (error) {
    logger.error("Error in generating feedback", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
};
