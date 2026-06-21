import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant({ floating = false }: { floating?: boolean }) {
  const [isOpen, setIsOpen] = useState(!floating);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "你好！我是智源嘉创AI科创助手🤖\n\n我可以帮你：\n• 了解9大服务模块详情\n• 推荐适合企业的服务方案\n• 解读科技政策与资质申报\n• 初步诊断企业成长痛点\n\n请告诉我你的企业情况或想了解的服务！" },
  ]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => "session_" + Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.aiAssistant.chat.useMutation();

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = useCallback(async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    try {
      const result = await chatMutation.mutateAsync({
        sessionId,
        message: userMsg,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "抱歉，服务暂时不可用，请稍后重试。" }]);
    }
  }, [input, messages, sessionId, chatMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const chatPanel = (
    <div className={`${floating ? "h-[520px] w-[420px]" : "h-full"} flex flex-col bg-[#131d2b] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#0f1923]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">AI科创助手</h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />DeepSeek 在线</p>
          </div>
        </div>
        {floating && (
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
              msg.role === "user" ? "bg-amber-500 text-black" : "bg-[#1a2635] text-gray-200 border border-gray-700"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-[#1a2635] border border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-[#0f1923]">
        <div className="flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="咨询科技服务、政策解读、企业诊断..."
            className="flex-1 resize-none bg-[#1a2635] border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 h-[44px]"
            rows={1} />
          <button onClick={send} disabled={chatMutation.isPending || !input.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );

  if (!floating) return chatPanel;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          {chatPanel}
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-black rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105">
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </>
  );
}
