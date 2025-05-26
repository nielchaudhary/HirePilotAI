export interface IMessage {
  id: string;
  role: ROLE;
  content: string;
  timestamp: Date;
}

export const OPEROUTER_BASE_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

export enum ROLE {
  USER = "user",
  SYSTEM = "system",
}

export interface IInterviewTranscript {
  id: string;
  interviewId: string;
  userInfo: IUserInfo;
  messages: IMessage[];
}

export interface IUserInfo {
  name: string;
  email: string;
  phone: string;
}

export const resumeParsingPrompt = `Extract the following information from this resume and return it as JSON:
{
    "name" : "",
    "email" : "",
    "phone" : "",
    
}
`;

export const feedbackPrompt = `You are Hirepilot, an AI Interviewer. You have to generate a feedback for the messages sent by role user (which is the candidate) and the messages sent by role assistant (which is you). Provide a JSON Response with the following format:
{
    "feedback" : "",
    "technical and personality strengths" : [minimum 2 & maximum 3],
    "technical and personality weaknesses" : [minimum 2 & maximum 3],
    
}
Generate a feedback for the interview based on the following transcript provided to you:
`;
