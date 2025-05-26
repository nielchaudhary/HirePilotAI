import { Router } from "express";
import { parseResumePostHandler } from "./api/resume-parser";
import { chatCompletionPostHandler } from "./api/openai";
import { transcriptsPostHandler } from "./api/transcripts";

const router = Router();

router.post("/chat", chatCompletionPostHandler);
router.post("/parse", parseResumePostHandler);
router.post("/transcripts", transcriptsPostHandler);

export const chatRouter: [string, Router] = ["/hirepilot/v1", router];
