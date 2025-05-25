import { Router } from "express";
import { parseResumePostHandler } from "./api/resume-parser";
import { openaiCompletionPostHandler } from "./api/openai";

const router = Router();

router.post("/chat", openaiCompletionPostHandler);
router.post("/parse", parseResumePostHandler);

export const chatRouter: [string, Router] = ["/hirepilot/v1", router];
