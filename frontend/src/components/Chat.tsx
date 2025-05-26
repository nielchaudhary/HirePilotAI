import { useState, useEffect, useCallback, useMemo } from "react";
import { IconLogout, IconSend, IconUpload } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  chatAPI,
  createErrorMessage,
  createMessage,
  createThinkingMessage,
  ERROR_MESSAGES,
  ROLE,
  THINKING_MESSAGE,
  type ChatProps,
  type Message,
} from "../lib/data";
import { useAutoScroll, useStreamingResponse } from "../lib/hooks";

// Components
const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
  if (!pdfUrl) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 space-y-6 p-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
          <IconUpload className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-600">
            No document uploaded
          </p>
          <p className="text-sm text-gray-400">
            Upload a PDF to get started with the interview process
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0`}
      className="w-full h-full border-0"
      title="PDF Viewer"
    />
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === ROLE.USER;
  const isThinking = message.content === THINKING_MESSAGE;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[50%] rounded-xl p-4 shadow-sm ${
          isUser ? "bg-[#007AFF] text-white" : "bg-[#2A2A2A] text-white"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed flex items-center">
          {message.content}
          {isThinking && (
            <span className="inline-flex ml-1 font-bold text-blue-500">
              <span className="animate-pulse text-lg">.</span>
              <span className="animate-pulse delay-75 text-lg">.</span>
              <span className="animate-pulse delay-150 text-lg">.</span>
            </span>
          )}
        </div>
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ parsedResume }: { parsedResume: string }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4 max-w-md">
      <p className="text-gray-500">
        {parsedResume
          ? "Interview will start automatically..."
          : "Upload your resume to begin the interview"}
      </p>
    </div>
  </div>
);

const ChatInput = ({
  input,
  setInput,
  onSubmit,
  isInterviewStarted,
  isThinking,
}: {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isInterviewStarted: boolean;
  isThinking: boolean;
}) => (
  <form
    onSubmit={onSubmit}
    className="border-t border-[#2A2A2A] bg-[#1A1A1A] p-6"
  >
    <div className="flex space-x-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          isInterviewStarted
            ? "Type your response here..."
            : "Please wait for the interview to start..."
        }
        disabled={!isInterviewStarted}
        className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || !isInterviewStarted || isThinking}
        className="bg-black text-white rounded-xl px-6 py-3 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium border border-gray-200"
      >
        <IconSend className="w-4 h-4" />
      </button>
    </div>
  </form>
);

// Main component
export const Chat = ({ pdfUrl, parsedResume }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const navigate = useNavigate();
  const messagesEndRef = useAutoScroll(messages);
  const { streamResponse } = useStreamingResponse();

  // Memoized values
  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);
  const canSubmit = useMemo(
    () => input.trim() && isInterviewStarted && !isThinking,
    [input, isInterviewStarted, isThinking]
  );

  // Interview initialization
  const startInterview = useCallback(async () => {
    if (isInterviewStarted || !parsedResume) return;

    setIsInterviewStarted(true);
    setIsThinking(true);

    const thinkingMessage = createThinkingMessage();
    setMessages([thinkingMessage]);

    const assistantMessageId = `${Date.now()}-interview-start`;

    try {
      const response = await chatAPI.sendMessage("", parsedResume, true);
      setIsThinking(false);

      // Initialize empty response message
      const emptyResponse = createMessage(ROLE.SYSTEM, "", assistantMessageId);
      setMessages([emptyResponse]);

      // Stream the response
      await streamResponse(response, (content) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content } : msg
          )
        );
      });
    } catch (error) {
      console.error("Error starting interview:", error);
      setMessages([createErrorMessage(ERROR_MESSAGES.INTERVIEW_START)]);
    } finally {
      setIsThinking(false);
    }
  }, [isInterviewStarted, parsedResume, streamResponse]);

  // send user message
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const userMessage = createMessage(ROLE.USER, input);
      const thinkingMessage = createThinkingMessage();

      setMessages((prev) => [...prev, userMessage, thinkingMessage]);
      setInput("");
      setIsThinking(true);

      const assistantMessageId = `${Date.now()}-response`;

      try {
        const response = await chatAPI.sendMessage(input);
        setIsThinking(false);

        // replace thinking message with empty response
        const emptyResponse = createMessage(
          ROLE.SYSTEM,
          "",
          assistantMessageId
        );
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          emptyResponse,
        ]);

        // stream the response
        await streamResponse(response, (content) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content } : msg
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
    [canSubmit, input, streamResponse]
  );

  const handleExitInterview = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      try {
        toast.success("Interview Completed, please wait for a while");
        await chatAPI.saveTranscript(messages);
        navigate("/thank-you");
      } catch (error) {
        console.error("Error saving transcript:", error);
        toast.error("Error saving interview transcript");
      }
    },
    [messages, navigate]
  );

  useEffect(() => {
    if (parsedResume && !isInterviewStarted) {
      startInterview();
    }
  }, [parsedResume, isInterviewStarted, startInterview]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0A1929] via-[#0F2942] to-[#143556] text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-serif">HirePilot AI</h2>
        </div>
        <button
          className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
          onClick={handleExitInterview}
        >
          <span className="flex items-center">
            <IconLogout className="w-4 h-4 mr-1.5" />
            Exit Interview
          </span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 overflow-hidden bg-gray-50">
            <PDFViewer pdfUrl={pdfUrl} />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="w-1/2 flex flex-col bg-[#121212]">
          {/* Messages */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-4 bg-black">
            {!hasMessages ? (
              <EmptyState parsedResume={parsedResume} />
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Form */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isInterviewStarted={isInterviewStarted}
            isThinking={isThinking}
          />
        </div>
      </div>
    </div>
  );
};
