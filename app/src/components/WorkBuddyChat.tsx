import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "research_start" | "research_progress" | "research_complete";
}

interface WorkBuddyChatProps {
  onClose: () => void;
  onResearchComplete: (result: any, projectName: string) => void;
}

const STORAGE_KEY = "zeta_chat_history";
const PROJECT_KEY = "zeta_chat_project";

function loadHistory(): Message[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [
    {
      id: "welcome",
      role: "assistant",
      content: `你好！我是ZETA-Score调研助手。我可以帮你对AI-Infra项目进行全面深度调研。\n\n请告诉我：\n1. **项目名称**（必填）\n2. **项目描述或你想了解的内容**（如核心技术、团队背景、市场情况等）\n\n我会自动调研并生成包含以下四方面信息的报告：\n- 基础信息 | 技术与团队 | 市场与竞争 | 投资方向与赋能匹配`,
      type: "text",
    },
  ];
}

function loadProjectName(): string {
  try {
    return localStorage.getItem(PROJECT_KEY) || "";
  } catch { return ""; }
}

export function WorkBuddyChat({ onClose, onResearchComplete }: WorkBuddyChatProps) {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [projectName, setProjectName] = useState<string>(loadProjectName);
  const [isResearching, setIsResearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const researchMutation = trpc.research.conduct.useMutation();

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Persist project name
  useEffect(() => {
    if (projectName) {
      localStorage.setItem(PROJECT_KEY, projectName);
    }
  }, [projectName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResearching]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROJECT_KEY);
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `聊天记录已清空。\n\n请告诉我新的项目名称和描述，我将为您进行深度调研。`,
        type: "text",
      },
    ]);
    setProjectName("");
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isResearching) return;

    const userInput = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Auto-detect project name from first line
    let name = projectName;
    if (!name) {
      const firstLine = userInput.split(/[\n，,。；;]/)[0].trim();
      if (firstLine && firstLine.length <= 30) {
        name = firstLine;
        setProjectName(name);
      }
    }

    if (!name) {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "请先提供**项目名称**（放在消息开头），这样我可以更精准地进行调研。\n\n例如：「趋境科技，专注于AI推理基础设施的研发」",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // Start research
    setIsResearching(true);
    const startMsg: Message = {
      id: (Date.now() + 2).toString(),
      role: "assistant",
      content: `🔍 正在对「**${name}**」启动深度调研...\n\n调研流程：\n1️⃣ 基础信息收集\n2️⃣ 技术与团队分析\n3️⃣ 市场与竞争格局\n4️⃣ 投资方向与赋能匹配评估\n\n⏱️ 预计需要 20-40 秒，请稍候...`,
      type: "research_start",
    };
    setMessages((prev) => [...prev, startMsg]);

    try {
      const result = await researchMutation.mutateAsync({
        projectName: name,
        query: userInput,
      });

      const completeMsg: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: `✅ 调研完成！已为「**${name}**」生成完整调研报告。\n\n📊 四方面信息已自动提取：\n• **基础信息**：公司名称、业务定位、融资阶段等\n• **技术与团队**：核心技术、专利布局、TRL/MRL评估\n• **市场与竞争**：TAM/SAM/SOM、竞争格局、差异化策略\n• **投资方向匹配**：基金方向匹配度、研究院赋能板块匹配\n\n💡 所有信息均可**手动修改调整**。点击「查看报告」进入详情页。`,
        type: "research_complete",
      };
      setMessages((prev) => [...prev, completeMsg]);

      onResearchComplete(result, name);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: `❌ 调研过程中出现错误：${error.message || "未知错误"}\n\n可能的原因：\n- DeepSeek API 暂时不可用\n- 网络连接问题\n\n请稍后重试，或检查网络连接。`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsResearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[900px] h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">ZETA-Score 调研助手</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                DeepSeek AI 在线
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 2 && (
              <button
                onClick={clearHistory}
                className="text-xs px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空记录
              </button>
            )}
            {projectName && (
              <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                当前项目：{projectName}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-amber-500 text-white"
                    : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          {isResearching && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="text-sm text-gray-500 ml-2">深度调研中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  projectName
                    ? "请描述你想调研的项目信息，如核心技术、团队背景、市场情况等..."
                    : "请输入项目名称和描述，例如：光联芯科，专注于IO光互连芯片研发..."
                }
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[60px] max-h-[120px]"
                style={{ color: "#111827" }}
                rows={2}
                disabled={isResearching}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isResearching}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              发送
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            按 Enter 发送，Shift + Enter 换行
          </p>
        </div>
      </div>
    </div>
  );
}
