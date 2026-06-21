import { useState } from "react";

// 从环境变量读取 DeepSeek API Key，避免将密钥硬编码到代码中
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_MODULES = [
  {
    id: "patent-filing",
    title: "专利申报",
    desc: "提供关于专利申报的全流程AI自动化咨询与回答",
    icon: "📋",
    systemPrompt: `你是专利申报AI顾问，精通中国专利法、专利审查指南及专利申报全流程。你可以回答以下问题：
1. 专利申请类型选择（发明/实用新型/外观设计）
2. 专利申报流程与时间节点
3. 专利文件撰写要点（权利要求书、说明书、摘要）
4. 专利费用与减缴政策
5. PCT国际专利申请流程
6. 专利审查意见答复策略
7. 专利加速审查（优先审查、预审）
请以专业、清晰、易懂的方式回答用户问题，必要时引用相关法规条款。`,
  },
  {
    id: "ai-rd",
    title: "AI辅助研发",
    desc: "结合企业核心技术和发展路线，提供围绕核心技术相关的检索与分析",
    icon: "🔬",
    systemPrompt: `你是AI辅助研发智能体，专注于技术检索与专利分析。你可以帮助企业：
1. 围绕核心技术进行专利检索与分析
2. 技术发展趋势研判
3. 竞争对手技术布局分析
4. 技术空白点识别
5. 研发方向建议
6. 技术路线规划参考

请基于用户的核心技术描述，提供有深度的技术分析和研发建议。回答应包含具体的技术细节和可操作的建议。`,
  },
  {
    id: "legal",
    title: "法律咨询",
    desc: "针对专利申请、诉讼等方面的问题，提供AI智能体自动答复",
    icon: "⚖️",
    systemPrompt: `你是知识产权法律AI顾问，精通专利法、商标法、著作权法及相关法律实务。你可以回答：
1. 专利侵权判定与抗辩策略
2. 专利无效宣告程序
3. 专利诉讼流程与费用
4. 技术合同法律问题（转让、许可、合作开发）
5. 商业秘密保护
6. 知识产权维权策略
7. FTO（自由实施）分析法律问题

请注意：你的回答仅供参考，不构成正式法律意见。复杂案件建议咨询专业律师。`,
  },
];

export function PatentServicesPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeModuleData = AI_MODULES.find((m) => m.id === activeModule);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeModuleData || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: inputText.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: activeModuleData.systemPrompt },
            ...newMessages,
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const aiReply: ChatMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "抱歉，未能获取回复，请稍后重试。",
      };
      setChatMessages([...newMessages, aiReply]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `请求失败：${(err as Error).message}。请检查网络连接后重试。`,
      };
      setChatMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">专利服务</h1>
        <p className="text-gray-400">一站式专利检索与AI赋能服务</p>
      </div>

      {!activeModule ? (
        <div className="space-y-6">
          {/* 专利检索平台 */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">PatSeek 专利检索平台</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  专业的AI驱动专利检索平台，支持全球专利数据检索、技术图谱分析、竞争对手监控、专利价值评估等功能。
                  覆盖中国、美国、欧洲、日本、韩国等主要专利局的专利数据。
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full">全球专利检索</span>
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full">技术图谱分析</span>
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full">竞争对手监控</span>
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full">专利价值评估</span>
                  <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full">AI智能推荐</span>
                </div>
                <a
                  href="https://patseek.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                  访问 patseek.cn
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* AI赋能单元 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-amber-400">🤖</span> AI赋能单元
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {AI_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => { setActiveModule(mod.id); setChatMessages([]); }}
                  className="bg-[#131d2b] border border-gray-700/50 rounded-xl p-6 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer group"
                >
                  <div className="text-3xl mb-3">{mod.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{mod.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{mod.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>进入对话</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AI Chat Interface */
        <div className="flex flex-col h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => { setActiveModule(null); setChatMessages([]); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">返回</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeModuleData?.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-white">{activeModuleData?.title}</h2>
                <p className="text-xs text-gray-400">{activeModuleData?.desc}</p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-[#131d2b] border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">{activeModuleData?.icon}</div>
                  <p className="text-gray-400 text-sm">
                    {activeModule === "patent-filing" && "请输入您的专利申报相关问题，我将为您提供专业解答"}
                    {activeModule === "ai-rd" && "请描述您的核心技术方向，我将为您提供技术检索与分析建议"}
                    {activeModule === "legal" && "请输入您的知识产权法律问题，我将为您提供参考建议"}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {activeModule === "patent-filing" && [
                      "发明专利和实用新型有什么区别？",
                      "专利申请需要多长时间？",
                      "如何申请专利费用减缴？",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInputText(q); }}
                        className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                    {activeModule === "ai-rd" && [
                      "帮我分析硅光CPO技术发展趋势",
                      "如何围绕核心技术进行专利布局？",
                      "如何识别技术空白点？",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInputText(q); }}
                        className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                    {activeModule === "legal" && [
                      "如何判断是否侵犯他人专利权？",
                      "专利无效宣告的流程是什么？",
                      "技术许可合同需要注意什么？",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInputText(q); }}
                        className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-amber-500 text-black"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入您的问题..."
                  rows={2}
                  className="flex-1 bg-[#0b1120] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-medium rounded-xl transition-colors self-end"
                >
                  发送
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {activeModule === "legal" && "⚠️ AI回答仅供参考，不构成正式法律意见。复杂案件建议咨询专业律师。"}
                {activeModule !== "legal" && "AI回答基于DeepSeek大模型，仅供参考。"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
