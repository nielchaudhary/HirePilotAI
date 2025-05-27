import {
  ROLE,
  THINKING_MESSAGE,
  type IUserInfo,
  type Message,
} from "../lib/data";
import { PlaceholdersAndVanishInput } from "./PlaceHoldersAndVanishInput";

export const ChatInput = ({
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
}) => {
  const placeholders = isInterviewStarted
    ? ["Type your response here...", "Answer the question..."]
    : ["Please wait for the interview to start..."];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] p-6">
      <div className="flex ">
        <div className="flex-1 relative">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            value={input}
            setValue={setInput}
            disabled={!isInterviewStarted || isThinking}
          />
        </div>
      </div>
    </div>
  );
};

export const EmptyState = ({ userInfo }: { userInfo: IUserInfo }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4 max-w-md">
      <p className="text-gray-500">
        {userInfo
          ? "Interview will start automatically..."
          : "Upload your resume to begin the interview"}
      </p>
    </div>
  </div>
);

export const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === ROLE.USER;
  const isThinking = message.content === THINKING_MESSAGE;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[50%] rounded-xl p-4 shadow-sm ${
          isUser ? "bg-[#2A2A2A] text-white" : "bg-[#2A2A2A] text-white"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed flex items-center">
          {message.content}
          {isThinking && (
            <span className="inline-flex ml-1 font-bold text-white">
              <span className="animate-pulse text-lg">.</span>
              <span className="animate-pulse delay-75 text-lg">.</span>
              <span className="animate-pulse delay-150 text-lg">.</span>
            </span>
          )}
        </div>
        <div
          className={`text-xs mt-1 ${
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
