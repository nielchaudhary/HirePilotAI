import { useState, useRef, useEffect } from "react";
import { IconSend, IconFile, IconUpload } from "@tabler/icons-react";
import { BASE_URL } from "../utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const Chat = (props: { pdfUrl: string; parsedResume: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pdfUrl = props.pdfUrl;
  useEffect(() => {
    if (props.parsedResume && !isInterviewStarted) {
      startInterview();
    }
  }, [props.parsedResume, isInterviewStarted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    if (isInterviewStarted || !props.parsedResume) return;

    setIsInterviewStarted(true);
    setIsLoading(true);

    const loadingMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Starting your interview...",
      timestamp: new Date(),
    };
    setMessages([loadingMessage]);

    const assistantMessageId = Date.now().toString() + "-interview-start";
    const tempAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev.slice(0, -1), tempAssistantMessage]);

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "", // resume parsing for BE
          resume: props.parsedResume,
          isInitialLoad: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessage }
              : msg
          )
        );
      }

      // temp message to final message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                id: Date.now().toString(),
                content: assistantMessage,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error starting interview:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error starting the interview. Please try again.",
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading || !isInterviewStarted) return;

    // user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    //temporary assistant message
    const assistantMessageId = Date.now().toString() + "-response";
    const tempAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempAssistantMessage]);

    try {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          isInitialLoad: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantMessage }
              : msg
          )
        );
      }

      // temp message to final message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                id: Date.now().toString(),
                content: assistantMessage,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Common Header */}
      <header className="bg-gradient-to-r from-black to-gray-50 to-black text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <IconFile className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold font-serif">Resume</h2>
        </div>
        <div className="text-right">
          <h1 className="text-xl text-black font-serif font-bold">
            HirePilot AI
          </h1>
          <p className="text-black text-sm mt-1 font-bold">
            Your AI Interview Assistant
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="flex-1 overflow-hidden bg-gray-50">
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0`}
                className="w-full h-full border-0"
                title="PDF Viewer"
              />
            ) : (
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
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="w-1/2 flex flex-col bg-black">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F7F7]">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <p className="text-gray-500">
                    {props.parsedResume
                      ? "Interview will start automatically..."
                      : "Upload your resume to begin the interview"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[50%] rounded-xl p-4 shadow-sm ${
                        message.role === "user"
                          ? "bg-white text-black"
                          : "bg-gradient-to-r from-[#43C6AC] to-[#F8FFAE] border border-gray-200 text-gray-800 font-serif"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user" ? "text-black" : "text-black"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white p-6"
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
                disabled={!isInterviewStarted || isLoading}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all overflow-y-auto disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || !isInterviewStarted || isLoading}
                className="bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              >
                <IconSend className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
