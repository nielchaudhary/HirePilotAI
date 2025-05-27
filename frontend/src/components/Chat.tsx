import { useState, useEffect, useCallback, useRef } from "react";
import { IconLogout } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  chatAPI,
  COMPLETION_PHRASES,
  createErrorMessage,
  createMessage,
  createThinkingMessage,
  ERROR_MESSAGES,
  feedbackAndTranscriptLoadingStates,
  ROLE,
  type ChatProps,
  type IUserFeedback,
  type Message,
} from "../lib/data";
import { useAutoScroll, useStreamingResponse } from "../lib/hooks";
import { MultiStepLoader } from "./MultiStepLoader";
import { Spotlight } from "./Spotlight";
import { ChatInput, EmptyState, MessageBubble } from "./ChatComponents";

export const Chat = ({ userInfo }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [fetchingResponse, setFetchingResponse] = useState(false);
  const [completionHandled, setCompletionHandled] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useAutoScroll(messages);
  const { streamResponse } = useStreamingResponse();

  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const hasMessages = messages.length > 0;
  const canSubmit = input.trim() && isInterviewStarted && !isThinking;

  const createAssistantMessage = useCallback(() => {
    return createMessage(ROLE.SYSTEM, "", `${Date.now()}-response`);
  }, []);

  const startInterview = useCallback(async () => {
    if (isInterviewStarted || !userInfo) return;

    setIsInterviewStarted(true);
    setIsThinking(true);
    setMessages([createThinkingMessage()]);

    try {
      const response = await chatAPI.sendMessage("", userInfo, true);
      const assistantMessage = createAssistantMessage();
      setMessages([assistantMessage]);

      await streamResponse(response, (content) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id ? { ...msg, content } : msg
          )
        );
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setMessages([createErrorMessage(ERROR_MESSAGES.INTERVIEW_START)]);
    } finally {
      setIsThinking(false);
    }
  }, [isInterviewStarted, userInfo, streamResponse, createAssistantMessage]);

  const handleInputSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const userMessage = createMessage(ROLE.USER, input);
      const thinkingMessage = createThinkingMessage();
      const assistantMessage = createAssistantMessage();

      setMessages((prev) => [...prev, userMessage, thinkingMessage]);
      setInput("");
      setIsThinking(true);

      try {
        const response = await chatAPI.sendMessage(input, userInfo);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          assistantMessage,
        ]);

        await streamResponse(response, (content) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content } : msg
            )
          );
        });
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          createErrorMessage(ERROR_MESSAGES.GENERAL),
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [canSubmit, input, streamResponse, userInfo, createAssistantMessage]
  );

  const handleExitInterview = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement> | { preventDefault: () => void }
    ) => {
      e.preventDefault();
      if (fetchingResponse) return;

      try {
        setFetchingResponse(true);
        toast.success("Processing Interview, Please Do Not Reload the Page");

        const userFeedback = (await chatAPI.generateFeedback(
          messagesRef.current
        )) as {
          data: IUserFeedback;
        };

        await chatAPI.saveTranscript(
          messagesRef.current,
          userInfo,
          userFeedback.data
        );
        navigate("/thank-you");
      } catch (error) {
        setFetchingResponse(false);
        console.error("Error saving transcript:", error);
        toast.error("Error saving interview transcript");
      }
    },
    [navigate, userInfo, fetchingResponse]
  );

  useEffect(() => {
    if (messages.length === 0 || fetchingResponse || completionHandled) return;

    const lastMessage = messages[messages.length - 1];
    const isCompletionMessage =
      lastMessage.role === ROLE.SYSTEM &&
      COMPLETION_PHRASES.some((phrase) =>
        lastMessage.content.toLowerCase().includes(phrase)
      );

    if (isCompletionMessage) {
      setCompletionHandled(true);
      toast.success("Interview completed. Processing your results...");
      const timer = setTimeout(() => {
        handleExitInterview({
          preventDefault: () => {},
        } as React.MouseEvent<HTMLButtonElement>);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, fetchingResponse, handleExitInterview, completionHandled]);

  useEffect(() => {
    if (userInfo && !isInterviewStarted) {
      startInterview();
    }
  }, [userInfo, isInterviewStarted, startInterview]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-2xl bg-black rounded-4xl shadow-2xl overflow-hidden">
      <Spotlight />
      {fetchingResponse ? (
        <MultiStepLoader
          loadingStates={feedbackAndTranscriptLoadingStates}
          loading={fetchingResponse}
        />
      ) : (
        <>
          <header className="bg-[#121212] text-white p-6 flex justify-between items-center border border-gray-900">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-mono">HirePilot AI</h2>
            </div>
            <button
              className="group/btn relative flex items-center justify-center shadow-input w-40 h-10 rounded-xl font-bold bg-black border-transparent text-white text-sm dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626] cursor-pointer"
              onClick={handleExitInterview}
            >
              <span className="flex items-center">
                <IconLogout className="w-4 h-4 mr-1.5" />
                Exit Interview
              </span>
            </button>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-full flex flex-col bg-[#121212] border border-[#2A2A2A] rounded-xl">
              <div className="chat-messages-container flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-4 bg-black">
                {!hasMessages ? (
                  <EmptyState userInfo={userInfo} />
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleInputSubmit}
                isInterviewStarted={isInterviewStarted}
                isThinking={isThinking}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
