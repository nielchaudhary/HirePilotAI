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
