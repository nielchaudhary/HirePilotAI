import { BASE_URL } from "../utils";

export interface Message {
  id: string;
  role: ROLE;
  content: string;
  timestamp: Date;
}

export interface ChatProps {
  pdfUrl: string;
  parsedResume: string;
}

export const THINKING_MESSAGE = "HirePilot is thinking";

export enum ROLE {
  USER = "user",
  SYSTEM = "system",
}

export const ERROR_MESSAGES = {
  INTERVIEW_START:
    "Sorry, I encountered an error starting the interview. Please try again.",
  GENERAL: "Sorry, I encountered an error. Please try again.",
} as const;

export const createMessage = (
  role: ROLE,
  content: string,
  id?: string
): Message => ({
  id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content,
  timestamp: new Date(),
});

export const createThinkingMessage = (): Message =>
  createMessage(ROLE.SYSTEM, THINKING_MESSAGE);

export const createErrorMessage = (error: string): Message =>
  createMessage(ROLE.SYSTEM, error);

export const chatAPI = {
  sendMessage: async (
    message: string,
    resume?: string,
    isInitialLoad = false
  ) => {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        ...(resume && { resume }),
        isInitialLoad,
      }),
    });

    if (!response.ok) {
      throw new Error(`could not fetch the response due to ${response.status}`);
    }

    return response;
  },

  saveTranscript: async (messages: Message[]) => {
    return axios.post(`${BASE_URL}/transcripts`, { messages });
  },
};
