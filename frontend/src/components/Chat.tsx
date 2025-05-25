import { useState, useRef, useEffect } from "react";
import { IconSend, IconFile, IconUpload } from "@tabler/icons-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const Chat = (props: { pdfUrl: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pdfUrl = props.pdfUrl ?? "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex h-[90vh] w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden bg-black">
      {/* PDF Viewer */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        {/* PDF Header */}
        <div className="p-6 border-b border-white-300 bg-white">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <IconFile className="w-5 h-5 text-blue-600" />
            Resume
          </h2>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="h-full w-full  flex flex-col items-center justify-center text-gray-500 space-y-6 p-8">
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
        {/* Chat Header */}
        <header className="bg-gradient-to-r from-black to-gray-50 text-white p-6">
          <h1 className="text-xl font-serif font-bold">HirePilot AI</h1>
          <p className="text-[#F7F7F7] text-sm mt-1 font-bold">
            Your AI Interview Assistant
          </p>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F7F7]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                  <IconSend className="w-8 h-8 text-blue-600" />
                </div>
                <div></div>
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
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
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
              placeholder="Type your response here..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              <IconSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
