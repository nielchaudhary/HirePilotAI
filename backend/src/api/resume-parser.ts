import { isEmpty } from "lodash";
import { isNullOrUndefined } from "../utils/data";
import { Logger } from "../utils/logger";
import ResumeParser from "simple-resume-parser";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { generateCompletionUsingAI } from "../utils/api-helpers";

const logger = new Logger("resume-parser");

export const parseResumePostHandler = async (req: Request, res: Response) => {
  logger.info("Received Resume, Parsing the Information");
  try {
    const { resume } = req.files as { resume: any };

    if (isNullOrUndefined(resume) || isEmpty(resume)) {
      res.status(400).json({ error: "Missing resume" });
      return;
    }

    const allowedFileTypes = [".pdf"];

    if (!allowedFileTypes.includes(path.extname(resume.name))) {
      res.status(400).json({ error: "Invalid file type" });
      return;
    }

    const tempDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const fileExt = path.extname(resume.name);
    const fileName = `resume_${Date.now()}${fileExt}`;
    const filePath = path.join(tempDir, fileName);

    await resume.mv(filePath);

    const parsedResume = await generateCompletionUsingAI(filePath);

    res.status(200).json({
      parsedResume,
    });
  } catch (error) {
    logger.error(`failed to parse resume due to ${error}`);
    res.status(500).json({ error: "failed to parse resume" });
    return;
  }
};
