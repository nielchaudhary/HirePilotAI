import { isEmpty } from "lodash";
import { isNullOrUndefined, IUserInfo } from "../utils/data";
import { Logger } from "../utils/logger";
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

    //get userinformation and the skills from the resume
    const parsedResume = (await generateCompletionUsingAI(filePath)) as string;

    const { name, email, phone, skills, experience, projects } = JSON.parse(
      parsedResume
    ) as IUserInfo;

    const userInfo: IUserInfo = {
      name,
      email,
      phone,
      skills,
      experience,
      projects,
    };
    res.status(200).send(userInfo);
    return;
  } catch (error) {
    logger.error(`failed to parse resume due to ${error}`);
    res.status(500).json({ error: "failed to parse resume" });
    return;
  }
};
