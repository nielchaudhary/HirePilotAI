import { Router } from "express";
import { parseResumePostHandler } from "./api/resume-parser";
import { openaiCompletionPostHandler } from "./api/openai";
import { transcriptsPostHandler } from "./api/transcripts";

const router = Router();

router.post("/chat", openaiCompletionPostHandler);
router.post("/parse", parseResumePostHandler);
router.post("/transcripts", transcriptsPostHandler);

export const chatRouter: [string, Router] = ["/hirepilot/v1", router];
