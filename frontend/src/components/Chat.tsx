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

/**
 * Main Chat Component - Handles the entire interview chat flow
 * This component manages:
 * - Interview initialization and auto-start
 * - Message state management (user messages, AI responses, thinking states)
 * - Real-time streaming of AI responses
 * - Interview completion detection and automatic exit
 * - Feedback generation and transcript saving
 */
export const Chat = ({ userInfo }: ChatProps) => {
  // ===== STATE MANAGEMENT =====

  // Core chat state - stores all messages in the conversation
  const [messages, setMessages] = useState<Message[]>([]);

  // Current user input being typed
  const [input, setInput] = useState("");

  // Flag to track if interview has been initiated
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // Shows thinking indicator when AI is processing
  const [isThinking, setIsThinking] = useState(false);

  // Prevents user interaction while processing final results while getting feedback
  const [fetchingResponse, setFetchingResponse] = useState(false);

  // Prevents multiple completion handlers from running
  const [completionHandled, setCompletionHandled] = useState(false);

  // Navigation hook for redirecting after interview completion
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages are added
  const messagesEndRef = useAutoScroll(messages);

  // Custom hook for streaming AI responses in real-time
  const { streamResponse } = useStreamingResponse();

  // Ref to access current messages in async callbacks (prevents stale closure issues)
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Check if there are any messages to display
  const hasMessages = messages.length > 0;

  // Determine if user can submit input (has text, interview started, not thinking)
  const canSubmit = input.trim() && isInterviewStarted && !isThinking;

  /**
   * Creates a new assistant message with unique ID for streaming responses
   */
  const createAssistantMessage = useCallback(() => {
    return createMessage(ROLE.SYSTEM, "", `${Date.now()}-response`);
  }, []);

  /**
   * INTERVIEW INITIALIZATION FLOW:
   * 1. Set interview as started
   * 2. Show thinking indicator
   * 3. Send initial empty message to API to get first question
   * 4. Stream the AI's first question/greeting
   * 5. Remove thinking indicator when complete
   */
  const startInterview = useCallback(async () => {
    // Prevent multiple starts or starting without user info
    if (isInterviewStarted || !userInfo) return;

    // Step 1: Mark interview as started and show thinking
    setIsInterviewStarted(true);
    setIsThinking(true);
    setMessages([createThinkingMessage()]);

    try {
      // Step 2: Get initial AI response (first question/greeting)
      const response = await chatAPI.sendMessage("", userInfo, true);
      const assistantMessage = createAssistantMessage();
      setMessages([assistantMessage]);

      // Step 3: Stream the response in real-time
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
      // Step 4: Remove thinking indicator
      setIsThinking(false);
    }
  }, [isInterviewStarted, userInfo, streamResponse, createAssistantMessage]);

  /**
   * USER INPUT SUBMISSION FLOW:
   * 1. Add user message to chat
   * 2. Show thinking indicator
   * 3. Send message to API
   * 4. Stream AI response in real-time
   * 5. Handle any errors gracefully
   */

  const handleInputSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      // Step 1: Create message objects
      const userMessage = createMessage(ROLE.USER, input);
      const thinkingMessage = createThinkingMessage();
      const assistantMessage = createAssistantMessage();

      // Step 2: Add user message and thinking indicator to chat
      setMessages((prev) => [...prev, userMessage, thinkingMessage]);
      setInput(""); // Clear input field
      setIsThinking(true);

      try {
        // Step 3: Send user input to API
        const response = await chatAPI.sendMessage(input, userInfo);

        // Step 4: Replace thinking message with assistant message for streaming
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          assistantMessage,
        ]);

        // Step 5: Stream the AI response in real-time
        await streamResponse(response, (content) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content } : msg
            )
          );
        });
      } catch (error) {
        console.error("Error:", error);
        // Replace thinking message with error message
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== thinkingMessage.id),
          createErrorMessage(ERROR_MESSAGES.GENERAL),
        ]);
      } finally {
        setIsThinking(false);
      }
    },

    //the canSubmit & input changes constantly, due to which the function gets recreated again and again, why do we use useCallback then?
    // can be removed to make an inline function.
    [canSubmit, input, streamResponse, userInfo, createAssistantMessage]
  );

  /**
   * INTERVIEW EXIT FLOW:
   * 1. Prevent exit if already processing
   * 2. Generate feedback based on conversation
   * 3. Save transcript with feedback
   * 4. Navigate to thank you page
   */

  const handleExitInterview = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement> | { preventDefault: () => void }
    ) => {
      e.preventDefault();
      // Prevent multiple exit attempts
      if (fetchingResponse) return;

      try {
        // Step 1: Set loading state and show progress indicator
        setFetchingResponse(true);
        toast.success("Processing Interview, Please Do Not Reload the Page");

        // Step 2: Generate AI feedback based on the conversation
        const userFeedback = (await chatAPI.generateFeedback(
          messagesRef.current
        )) as {
          data: IUserFeedback;
        };

        // Step 3: Save the complete transcript with feedback to backend
        await chatAPI.saveTranscript(
          messagesRef.current,
          userInfo,
          userFeedback.data
        );

        // Step 4: Navigate to results/thank you page
        navigate("/thank-you");
      } catch (error) {
        setFetchingResponse(false);
        console.error("Error saving transcript:", error);
        toast.error("Error saving interview transcript");
      } finally {
        setFetchingResponse(false);
        //not necessary to setIsInterviewStarted to false since the navigate resets and unmounts the entire chat component.
      }
    },
    [navigate, userInfo, fetchingResponse]
  );

  // ===== SIDE EFFECTS =====

  /**
   * AUTO-COMPLETION DETECTION:
   * Monitors messages for completion phrases from AI
   * Automatically triggers interview end when detected
   */
  useEffect(() => {
    // Skip if no messages, already processing, or completion already handled
    if (messages.length === 0 || fetchingResponse || completionHandled) return;

    const lastMessage = messages[messages.length - 1];

    // Check if the last AI message contains completion phrases
    const isCompletionMessage =
      lastMessage.role === ROLE.SYSTEM &&
      COMPLETION_PHRASES.some((phrase) =>
        lastMessage.content.toLowerCase().includes(phrase)
      );

    if (isCompletionMessage) {
      // Mark completion as handled to prevent multiple triggers
      setCompletionHandled(true);
      toast.success("Interview completed. Processing your results...");

      // Auto-exit after 2 seconds
      const timer = setTimeout(() => {
        handleExitInterview({
          preventDefault: () => {},
        } as React.MouseEvent<HTMLButtonElement>);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages, fetchingResponse, handleExitInterview, completionHandled]);

  /**
   * AUTO-START INTERVIEW:
   * Automatically starts interview when user info is available
   */
  useEffect(() => {
    if (userInfo && !isInterviewStarted) {
      startInterview();
    }
  }, [userInfo, isInterviewStarted, startInterview]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-2xl bg-black rounded-4xl shadow-2xl overflow-hidden">
      {/* Background spotlight effect */}
      <Spotlight />

      {/* Show loading screen during final processing, otherwise show chat interface */}
      {fetchingResponse ? (
        <MultiStepLoader
          loadingStates={feedbackAndTranscriptLoadingStates}
          loading={fetchingResponse}
        />
      ) : (
        <>
          {/* Header with title and exit button */}
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

          {/* Main chat area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="w-full flex flex-col bg-[#121212] border border-[#2A2A2A] rounded-xl">
              {/* Messages container with auto-scroll */}
              <div className="chat-messages-container flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-4 bg-black">
                {!hasMessages ? (
                  // Show empty state before interview starts
                  <EmptyState userInfo={userInfo} />
                ) : (
                  // Show all messages
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {/* Scroll target for auto-scroll */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input area at bottom */}
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
