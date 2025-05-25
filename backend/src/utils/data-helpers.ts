import { Logger } from "./logger";
import dotenv from "dotenv";
import axios from "axios";
import ResumeParser from "simple-resume-parser";

dotenv.config();

const logger = new Logger("data-helpers");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

const OPEROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export const fetchOpenRouterChatCompletion = async (context: string) => {
  if (isNullOrUndefined(OPENROUTER_API_KEY)) {
    throw new Error("OPENROUTER_API_KEY not found");
  }

  const response = await axios.post(OPEROUTER_BASE_URL, {
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: context }],
      stream: true,
    }),
  });

  const reader = response.data?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append new chunk to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from buffer
      while (true) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content;
            if (content) {
              return content;
            }
          } catch (e) {
            logger.error(e);
          }
        }
      }
    }
  } finally {
    reader.cancel();
  }
};

export const parseResumeFile = async (resumePath: string) => {
  try {
    const resumeParser = new ResumeParser(resumePath);
    const parsedResume = await resumeParser.parseToJSON();
    logger.info("Resume parsed successfully", parsedResume);
    return parsedResume;
  } catch (error) {
    logger.error("Could not parse resume file due to ", error);
    throw error;
  }
};
