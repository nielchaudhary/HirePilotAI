import { isEmpty } from "lodash";
import {
  feedbackPrompt,
  IInterviewTranscript,
  isNullOrUndefined,
  OPEROUTER_BASE_URL,
  resumeParsingPrompt,
  ROLE,
} from "./data";
import { Response as ExpressResponse } from "express";
import pdfParse from "pdf-parse";
import { Logger } from "./logger";
import type { FetchResponse } from "../types/streaming-types";
import ResumeParser from "simple-resume-parser";
import fs from "fs";
import OpenAI from "openai";

const logger = new Logger("api-helpers");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  },
});

export const validateRequest = (
  message: string,
  resume: string | undefined,
  isInitialLoad: boolean
) => {
  if ((isNullOrUndefined(message) || isEmpty(message)) && !isInitialLoad) {
    return {
      valid: false,
      error: "Missing message in request body",
      status: 400,
    };
  }

  if (isInitialLoad && isNullOrUndefined(resume)) {
    return {
      valid: false,
      error: "Missing resume for initial load",
      status: 400,
    };
  }

  return { valid: true };
};

export const generateSystemContent = (resume?: string): string => {
  let systemContent = `You are HirePilot, an AI Interviewer interviewing a candidate for a job based on their skills. You will chat with the candidate and will be provided with the candidate's resume initially where you will get the skills of the candidate. You have to interview the candidate based on the resume skills. You have to question the technologies and the experience of the candidate based on the basis of skills provided by the candidate. YOU SHOULD NOT ANSWER THE TECHNICAL QUESTIONS ASKED BY THE CANDIDATE, YOU SHOULD CONTINUE ASKING QUESTIONS ON BASIS OF THE RESPONSES PROVIDED BY THE CANDIDATE. You have to ask questions on basis of the responses provided by the candidate as well. Keep asking the questions one by one on basis of the response provided by the candidate, stop this loop of asking on one topic after 3-4 questions on one topic and move to other. The Interview should last for no longer than 15 minutes. Structure the interview in such a way that you gain information about the technical skills, experience, and the ability to work in a team. Do not send any additional information other than the interview questions and responses. Do not send responses in bold font either. If the candidate wants to skip a question, you should not ask that question again. If the candidate wants to end the interview, you should not ask any more questions and ask the candidate to click the end interview button.`;

  if (resume) {
    systemContent += `\n\nThe candidate's resume in parsed format is: ${resume}. You have to interview the candidate on basis of this resume and keep this in context all the time till the interview ends. You have to parse the user information from the resume provided and confirm it with the user first. userInfo like name, email, phone number, etc is mandatory`;
  }

  return systemContent;
};

export const prepareMessages = (
  systemContent: string,
  message: string,
  isInitialLoad: boolean
) => {
  const messages = [
    {
      role: ROLE.SYSTEM,
      content: systemContent,
    },
  ];

  if (isInitialLoad) {
    messages.push({
      role: ROLE.USER,
      content:
        "Please start the interview with a greeting and your first question based on my resume.",
    });
  } else {
    messages.push({
      role: ROLE.USER,
      content: message,
    });
  }

  return messages;
};

export const setupResponseHeaders = (res: ExpressResponse) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
};

//used open router's streaming API - https://openrouter.ai/docs/api-reference/streaming
export const processStreamResponse = async (
  response: FetchResponse,
  res: ExpressResponse
) => {
  if (!response.body) {
    throw new Error("Response body is not readable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

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
              fullResponse += content;
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
};

export const fetchOpenRouterResponse = async (
  messages: any[],
  openRouterApiKey: string
) => {
  const response = await fetch(OPEROUTER_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
      "X-Title": "HirePilot",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-maverick:free",
      messages,
      stream: true,
    }),
  });

  return response;
};

export const parseResumeFile = async (resumePath: string) => {
  try {
    const resumeParser = new ResumeParser(resumePath);
    const parsedResume = await resumeParser.parseToJSON();
    return parsedResume;
  } catch (error) {
    logger.error("Could not parse resume file due to ", error);
    throw error;
  }
};

export const generateCompletionUsingAI = async (
  resumePath: string,
  generateFeedback?: boolean,
  messages?: Pick<IInterviewTranscript, "messages">[]
) => {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  const dataBuffer = fs.readFileSync(resumePath);
  const data = await pdfParse(dataBuffer);
  const resumeText = data.text;

  if (isNullOrUndefined(openRouterApiKey)) {
    throw new Error("OPENROUTER_API_KEY is not defined");
  }

  let systemContent = resumeParsingPrompt;

  !isNullOrUndefined(generateFeedback) && generateFeedback
    ? (systemContent +=
        feedbackPrompt + `Interview Transcript : ${JSON.stringify(messages)}`)
    : (systemContent += `Resume Details : ${resumeText}`);

  const completions = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: systemContent,
      },
    ],
  });
  logger.info("Completions : ", completions.choices[0].message.content);
  return completions.choices[0].message.content;
};
