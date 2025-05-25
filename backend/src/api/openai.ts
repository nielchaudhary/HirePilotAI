import { Request, Response } from "express";
import { Logger } from "../utils/logger";
import {
  isNullOrUndefined,
  openRouterApiKey,
  OPEROUTER_BASE_URL,
} from "../utils/data";
import { isEmpty } from "lodash";

const logger = new Logger("openai");

export const openaiCompletionPostHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { message, resume, isInitialLoad } = req.body as {
      message: string;
      resume?: string;
      isInitialLoad: boolean;
    };

    if ((isNullOrUndefined(message) || isEmpty(message)) && !isInitialLoad) {
      res.status(400).json({ error: "Missing message in request body" });
      return;
    }

    if (isInitialLoad && !resume) {
      res.status(400).json({ error: "Missing resume for initial load" });
      return;
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let systemContent = `You are HirePilot, an AI Interviewer interviewing a candidate for a job based on their skills. You will be provided with the candidate's resume initially where you will get the skills of the candidate. You have to interview the candidate based on the resume skills and the job description. You have to question the technologies and the experience of the candidate based on the basis of skills provided by the candidate. You have to ask questions on basis of the responses provided by the candidate as well. Keep asking the questions one by one on basis of the response provided by the candidate, stop this loop of asking on one topic after 3-4 questions on one topic and move to other. The Interview should last for no longer than 15 minutes. Structure the interview in such a way that you gain information about the technical skills, experience, and the ability to work in a team. Do not send any additional information other than the interview questions and responses. Do not send responses in bold font either. If the candidate wants to skip a question, you should not ask that question again. If the candidate wants to end the interview, you should not ask any more questions and ask the candidate to click the end interview button.`;

    if (isInitialLoad && resume) {
      systemContent += `\n\nThe candidate's resume in parsed format is: ${resume}. You have to interview the candidate on basis of this resume and keep this in context all the time till the interview ends.`;
    }

    const messages = [
      {
        role: "system",
        content: systemContent,
      },
    ];

    if (isInitialLoad) {
      messages.push({
        role: "user",
        content:
          "Please start the interview with a greeting and your first question based on my resume.",
      });
    } else {
      messages.push({
        role: "user",
        content: message,
      });
    }

    const response = await fetch(OPEROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "X-Title": "HirePilot",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        stream: true,
      }),
    });

    if (isNullOrUndefined(response.body)) {
      logger.error("Response body is not readable");
      throw new Error("Response body is not readable");
    }

    const reader = response.body.getReader();
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
            if (data === "[DONE]") {
              res.end();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                res.write(content);
              }
            } catch (e) {
              logger.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } finally {
      reader.cancel();
      if (!res.writableEnded) {
        res.end();
      }
    }
  } catch (error) {
    logger.error("Error in openaiCompletion:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process completion" });
    }
  }
};
