import { Router } from "express";
import { streamChatCompletionPostHandler } from "./api/completions";
import { parseResumePostHandler } from "./api/resume-parser";

const router = Router();

router.post("/chat", streamChatCompletionPostHandler);
router.post("/parse", parseResumePostHandler);

export const chatRouter: [string, Router] = ["/hirepilot/v1", router];
