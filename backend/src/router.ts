import { Router } from "express";
import { parseResumePostHandler } from "./api/resume-parser";
import { chatCompletionPostHandler } from "./api/openai";
import { transcriptsPostHandler } from "./api/transcripts";
import { generateFeedbackPostHandler } from "./api/generate-feedback";

const router = Router();

router.post("/chat", chatCompletionPostHandler);
router.post("/parse", parseResumePostHandler);
router.post("/transcripts", transcriptsPostHandler);
router.post("/feedback", generateFeedbackPostHandler);

export const chatRouter: [string, Router] = ["/hirepilot/v1", router];
