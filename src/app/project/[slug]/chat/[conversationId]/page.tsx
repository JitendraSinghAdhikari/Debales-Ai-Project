"use client";
import { useConversation, useSendMessage } from "@/lib/hooks";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  createdAt: string | Date;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 text-xs">🤖</div>
      <div className="bg-surface-2 border border-surface-3 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${isUser ? "bg-brand-600 text-white" : "bg-gradient-to-br from-brand-500 to-brand-700 text-white"}`}>
        {isUser ? "U" : "🤖"}
      </div>
      <div className={`max-w-[70%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Steps */}
        {!isUser && message.steps && message.steps.length > 0 && (
          <div className="space-y-1">
            {message.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 bg-surface-2/50 rounded-lg px-3 py-1.5 border border-surface-3">
                <span className="text-brand-400">▸</span>
                {step}
              </div>
            ))}
          </div>
        )}
        {/* Content */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-brand-600 text-white rounded-tr-sm"
            : "bg-surface-2 border border-surface-3 text-slate-200 rounded-tl-sm"
        }`}>
          {message.content}
        </div>
        <span className="text-xs text-slate-600 px-1">
          {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : ""}
        </span>
      </div>
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  "What are my recent orders?",
  "Show me hot leads in CRM",
  "Analyze this week's sales performance",
  "Help me draft a follow-up email for Vikram Nair",
];

export default function ConversationPage() {
  const params = useParams();
  const slug = params.slug as string;
  const conversationId = params.conversationId as string;

  const { data, isLoading } = useConversation(slug, conversationId);
  const sendMessage = useSendMessage(slug, conversationId);
  const [input, setInput] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages: Message[] = [
    ...(data?.conversation?.messages || []),
    ...optimisticMessages,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend() {
    const content = input.trim();
    if (!content || isSending) return;

    setInput("");
    setIsSending(true);
    setOptimisticMessages([{ role: "user", content, createdAt: new Date() }]);

    try {
      await sendMessage.mutateAsync(content);
      setOptimisticMessages([]);
    } catch {
      setOptimisticMessages([]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-500 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full" data-testid="conversation-page">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm mb-6">Start the conversation by typing a message or choosing a suggestion:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="text-xs bg-surface-2 hover:bg-surface-3 border border-surface-4 text-slate-300 px-3 py-2 rounded-xl transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-surface-3 bg-surface-1" data-testid="chat-input-area">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end bg-surface-2 border border-surface-4 rounded-2xl px-4 py-3 focus-within:border-brand-500/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your AI assistant..."
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 resize-none focus:outline-none max-h-32"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
              data-testid="message-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex-shrink-0"
              data-testid="send-button"
            >
              {isSending ? "..." : "Send →"}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
