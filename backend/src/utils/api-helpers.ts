import { isEmpty } from "lodash";
import {
  feedbackPrompt,
  IInterviewTranscript,
  IMessage,
  isNullOrUndefined,
  IUserInfo,
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

import dotenv from "dotenv";
dotenv.config();

const logger = new Logger("api-helpers");

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

console.log("openRouterApiKey", openRouterApiKey);

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey,
  defaultHeaders: {
    Authorization: `Bearer ${openRouterApiKey}`,
  },
});

export const validateRequest = (
  message: string,
  userInfo: IUserInfo | undefined,
  isInitialLoad: boolean
) => {
  if ((isNullOrUndefined(message) || isEmpty(message)) && !isInitialLoad) {
    return {
      valid: false,
      error: "Missing message in request body",
      status: 400,
    };
  }

  if (isInitialLoad && isNullOrUndefined(userInfo)) {
    return {
      valid: false,
      error: "Missing resume for initial load",
      status: 400,
    };
  }

  return { valid: true };
};

export const generateSystemContent = (userInfo?: IUserInfo): string => {
  let systemContent = `You are HirePilot, an AI Interviewer interviewing a candidate for a job based on their skills. You will chat with the candidate and will be provided with the candidate's resume initially where you will get the skills of the candidate. You have to interview the candidate based on the resume skills.You should ask the about the resume skills in depth, and keep questioning the candidate 3-4 questions on one topic. YOU SHOULD NOT ANSWER THE TECHNICAL QUESTIONS ASKED BY THE CANDIDATE, YOU SHOULD CONTINUE ASKING QUESTIONS ON BASIS OF THE RESPONSES PROVIDED BY THE CANDIDATE. You have to ask questions on basis of the responses provided by the candidate as well. Keep asking the questions one by one on basis of the response provided by the candidate, stop this loop of asking on one topic after 3-4 questions on one topic and move to other. The Interview should last for no longer than 15 minutes. Structure the interview in such a way that you gain information about the technical skills, experience, and the ability to work in a team. Do not send any additional information other than the interview questions and responses. Do not send responses in bold font either. If the candidate wants to skip a question, you should not ask that question again. If the candidate wants to end the interview, you should not ask any more questions and ask the candidate to click the end interview button.`;

  if (userInfo) {
    systemContent += `\n\nThe candidate's resume in parsed format is: ${JSON.stringify(
      userInfo
    )}. You have to interview the candidate on basis of this resume and keep this in context all the time till the interview ends. You have to parse the skills and past work experience of the user from the resume provided`;
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
        "Please start the interview with a greeting and start asking the questions based on the resume skills that you have got.",
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
  messages?: IMessage[]
) => {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (isNullOrUndefined(openRouterApiKey)) {
    throw new Error("OPENROUTER_API_KEY is not defined");
  }

  let systemContent = "";
  let conversationMessages: IMessage[] = [];

  if (
    !generateFeedback &&
    !isNullOrUndefined(resumePath) &&
    resumePath.trim() !== ""
  ) {
    try {
      const dataBuffer = fs.readFileSync(resumePath);
      const data = await pdfParse(dataBuffer);
      const resumeText = data.text;
      systemContent = resumeParsingPrompt + `Resume Details : ${resumeText}`;
    } catch (error) {
      logger.error("Error reading resume file:", error);
      throw new Error(`Failed to read resume file: ${resumePath}`);
    }
  } else if (
    generateFeedback &&
    !isNullOrUndefined(messages) &&
    messages.length > 0
  ) {
    systemContent = feedbackPrompt;

    conversationMessages = messages
      .filter(
        (msg) =>
          msg.content &&
          msg.content.trim() !== "" &&
          msg.content !== "Thinking..."
      )
      .map((msg) => ({
        role: msg.role === ROLE.USER ? ROLE.USER : ROLE.SYSTEM,
        content: msg.content,
        id: msg.id,
        timestamp: msg.timestamp,
      }));
  } else {
    logger.error(
      "either provide resumePath for parsing or messages for feedback generation"
    );
  }

  try {
    const apiMessages = [
      {
        role: ROLE.SYSTEM,
        content: systemContent,
      },
      ...(generateFeedback ? conversationMessages : []),
      ...(generateFeedback
        ? [
            {
              role: ROLE.USER,
              content:
                "Please analyze the above interview conversation and provide feedback in the requested JSON format.",
            },
          ]
        : []),
    ];

    const completions = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: apiMessages,
    });

    const content = completions.choices[0].message.content;

    return content;
  } catch (error) {
    logger.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate AI completion");
  }
};
