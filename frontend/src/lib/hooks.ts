import { useRef, useEffect, useCallback } from "react";
import type { Message } from "./data";

// so basically, whenever the useRef is initialised to access the DOM element for example messageRef / autoScrolling, it will get rendered once on the component tree, and when the value i.e messageRef.current gets changed, it will basically just change the .current value, which is the regular object property without re-rendering the component.
export const useAutoScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return messagesEndRef;
};

//useCallback to memoize the function, since the streaming component does not change often, we have used it.
// In JavaScript, every function declaration creates a NEW function object.
// useCallback is used to memoize the function, so that it is not recreated on every render.

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
