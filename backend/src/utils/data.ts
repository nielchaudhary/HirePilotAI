import dotenv from "dotenv";

dotenv.config();

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
export const openRouterApiKey = process.env.OPENROUTER_API_KEY;

export const OPEROUTER_BASE_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;
