import { useRef, useEffect, useCallback } from "react";
import type { Message } from "./data";

export const useAutoScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return messagesEndRef;
};

export const useStreamingResponse = () => {
  const streamResponse = useCallback(
    async (response: Response, onChunk: (chunk: string) => void) => {
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullMessage += chunk;
          onChunk(fullMessage);
        }
      } finally {
        reader.releaseLock();
      }

      return fullMessage;
    },
    []
  );

  return { streamResponse };
};
