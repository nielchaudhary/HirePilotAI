import { Router } from "express";
import { streamChatCompletion } from "./api/completions";

const router = Router();

router.post("/chat", streamChatCompletion);

export const chatRouter: [string, Router] = ["/v1", router];
