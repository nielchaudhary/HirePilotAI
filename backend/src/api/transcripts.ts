import { Logger } from "../utils/logger";
import { Request, Response } from "express";
import { isEmpty } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { isNullOrUndefined } from "../utils/data";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const logger = new Logger("transcripts");

export const transcriptsPostHandler = async (req: Request, res: Response) => {
  logger.info("Received request for transcripts");
  try {
    const { messages } = req.body as {
      messages: {
        role: "user" | "system";
        content: string;
        timestamp: Date;
      }[];
    };

    if (isNullOrUndefined(messages) || isEmpty(messages)) {
      res.status(400).json({ error: "Missing messages in request body" });
      return;
    }

    const interviewId = uuidv4();
    await prisma.interview.create({
      data: {
        interviewId,
        messages,
      },
    });

    logger.info("Transcripts saved successfully to the Database");

    res.status(200).json({
      interviewId,
    });
  } catch (error) {
    logger.error("Error saving transcripts due to : ", error);
    res.send("Error saving transcripts");
    return;
  }
};
