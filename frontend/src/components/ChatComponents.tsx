import {
  ROLE,
  THINKING_MESSAGE,
  type IUserInfo,
  type Message,
} from "../lib/data";
import { PlaceholdersAndVanishInput } from "./PlaceHoldersAndVanishInput";

/**
 * CHAT INPUT COMPONENT
 * Handles user input with dynamic placeholders and submit functionality
 *
 * Features:
 * - Dynamic placeholder text based on interview state
 * - Form submission handling
 * - Disabled state management during thinking/loading
 * - Integration with custom PlaceholdersAndVanishInput component
 */
export const ChatInput = ({
  input,
  setInput,
  onSubmit,
  isInterviewStarted,
  isThinking,
}: {
  input: string; // Current input value
  setInput: (value: string) => void; // Function to update input
  onSubmit: (e: React.FormEvent) => void; // Form submission handler
  isInterviewStarted: boolean; // Whether interview has begun
  isThinking: boolean; // Whether AI is processing
}) => {
  // Dynamic placeholder text based on interview state
  const placeholders = isInterviewStarted
    ? ["Type your response here...", "Answer the question..."]
    : ["Please wait for the interview to start..."];

  /**
   * Handle form submission
   * Prevents default form behavior and calls parent's onSubmit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="border-t border-[#2A2A2A] bg-[#1A1A1A] p-6">
      <div className="flex ">
        <div className="flex-1 relative">
          {/* Custom input component with placeholder animations */}
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            value={input}
            setValue={setInput}
            // Disable input if interview hasn't started or AI is thinking
            disabled={!isInterviewStarted || isThinking}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * EMPTY STATE COMPONENT
 * Shows initial state before messages are displayed
 *
 * Displays different messages based on whether user info is available:
 * - If userInfo exists: Shows "Interview will start automatically..."
 * - If no userInfo: Shows "Upload your resume to begin the interview"
 */
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

/**
 * MESSAGE BUBBLE COMPONENT
 * Renders individual chat messages with different styles for user vs AI
 *
 * Features:
 * - Different alignment for user (right) vs AI (left) messages
 * - Special handling for "thinking" state with animated dots
 * - Timestamp display
 * - Role-based styling and positioning
 */
export const MessageBubble = ({ message }: { message: Message }) => {
  // Determine if message is from user (vs AI/system)
  const isUser = message.role === ROLE.USER;

  // Check if this is a thinking/loading message
  const isThinking = message.content === THINKING_MESSAGE;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[50%] rounded-xl p-4 shadow-sm ${
          // Both user and AI messages use same dark styling
          isUser ? "bg-[#2A2A2A] text-white" : "bg-[#2A2A2A] text-white"
        }`}
      >
        {/* Message content with special thinking animation */}
        <div className="whitespace-pre-wrap leading-relaxed flex items-center">
          {message.content}
          {/* Animated thinking dots when AI is processing */}
          {isThinking && (
            <span className="inline-flex ml-1 font-bold text-white">
              <span className="animate-pulse text-lg">.</span>
              <span className="animate-pulse delay-75 text-lg">.</span>
              <span className="animate-pulse delay-150 text-lg">.</span>
            </span>
          )}
        </div>

        {/* Timestamp with role-based coloring */}
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
