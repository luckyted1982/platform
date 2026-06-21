import { useState } from "react";

// 从环境变量读取 DeepSeek API Key，避免将密钥硬编码到代码中
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const COMPUTE_SERVICES = [
  {
    id: "gpu-rental",
    title: "GPU算力租赁",
    desc: "为企业提供优惠的GPU算力租赁服务，支持A100/H100/4090等主流GPU，按需弹性扩缩容",
    icon: "🖥️",
    features: ["A100/H100/4090多规格可选", "按需/包月灵活计费", "弹性扩缩容", "专属集群隔离"],
    discount: "平台企业专享8折优惠",
  },
  {
    id: "model-api",
    title: "大模型API接入",
    desc: "已接入DeepSeek等大模型API，提供Token调用服务，支持文本生成、代码生成、数据分析等场景",
    icon: "🤖",
    features: ["DeepSeek已接入", "多模型切换", "Token用量监控", "成本优化建议"],
    discount: "新企业赠送10万Token",
  },
  {
    id: "inference",
    title: "AI推理服务",
    desc: "提供模型部署与推理服务，支持主流框架（PyTorch/TensorFlow/vLLM），低延迟高吞吐",
    icon: "⚡",
    features: ["主流框架支持", "自动扩缩容", "低延迟推理", "模型版本管理"],
    discount: "首月免费试用",
  },
  {
    id: "consulting",
    title: "算力方案咨询",
    desc: "AI智能体提供算力需求评估、方案选型、成本优化等专业咨询服务",
    icon: "💡",
    features: ["需求评估", "方案选型", "成本优化", "架构设计"],
    discount: "免费AI咨询",
    isAI: true,
  },
];

const AI_CONSULT_SYSTEM = `你是算力服务AI顾问，专注于为企业提供算力基础设施咨询。你可以帮助：

1. 算力需求评估：根据企业的业务场景（模型训练/推理/数据处理）评估算力需求
2. GPU选型建议：根据任务类型推荐合适的GPU型号（A100/H100/4090等）
3. 成本优化：分析不同计费方式（按需/包月/预留实例）的成本差异
4. 架构设计：设计分布式训练、推理部署等技术架构
5. 平台对接：协助企业接入算力平台和大模型API

请以专业、实用的方式回答，给出具体的建议和数字参考。`;

export function ComputeServicesPage() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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
            { role: "system", content: AI_CONSULT_SYSTEM },
            ...newMessages,
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) throw new Error(`API请求失败: ${response.status}`);

      const data = await response.json();
      const aiReply: ChatMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "抱歉，未能获取回复，请稍后重试。",
      };
      setChatMessages([...newMessages, aiReply]);
    } catch (err) {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: `请求失败：${(err as Error).message}` },
      ]);
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
        <h1 className="text-3xl font-bold mb-2">算力接口</h1>
        <p className="text-gray-400">为企业提供优惠的算力接入与AI基础设施服务</p>
      </div>

      {!showChat ? (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">企业算力优惠计划</h2>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  智源嘉创平台联合多家算力服务商，为入驻企业提供专属算力优惠。涵盖GPU算力租赁、大模型API接入、
                  AI推理部署等全栈算力服务，助力企业降低AI研发成本，加速产品迭代。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">GPU算力租赁 8折</span>
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">新企业赠10万Token</span>
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">推理服务首月免费</span>
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">AI免费咨询</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-2 gap-4">
            {COMPUTE_SERVICES.map((svc) => (
              <div
                key={svc.id}
                className={`bg-[#131d2b] border rounded-xl p-6 transition-all ${
                  svc.isAI
                    ? "border-amber-500/20 hover:border-amber-500/40 cursor-pointer"
                    : "border-gray-700/50 hover:border-gray-600"
                }`}
                onClick={() => {
                  if (svc.isAI) {
                    setShowChat(true);
                    setChatMessages([]);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{svc.icon}</span>
                    <h3 className="text-lg font-bold text-white">{svc.title}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">{svc.discount}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{svc.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {svc.features.map((f) => (
                    <span key={f} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">{f}</span>
                  ))}
                </div>
                {svc.isAI && (
                  <div className="mt-4 flex items-center gap-1 text-xs text-amber-400">
                    <span>AI智能咨询</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pricing Table */}
          <div className="bg-[#131d2b] border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">算力资源参考价</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-xs text-gray-400">
                    <th className="pb-3 pr-4">GPU型号</th>
                    <th className="pb-3 pr-4">显存</th>
                    <th className="pb-3 pr-4">市场价(元/时)</th>
                    <th className="pb-3 pr-4">平台价(元/时)</th>
                    <th className="pb-3">适用场景</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 pr-4 font-medium text-white">NVIDIA A100</td>
                    <td className="py-3 pr-4">80GB</td>
                    <td className="py-3 pr-4 text-gray-400 line-through">12.0</td>
                    <td className="py-3 pr-4 text-green-400 font-medium">9.6</td>
                    <td className="py-3">大模型训练/微调</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 pr-4 font-medium text-white">NVIDIA H100</td>
                    <td className="py-3 pr-4">80GB</td>
                    <td className="py-3 pr-4 text-gray-400 line-through">22.0</td>
                    <td className="py-3 pr-4 text-green-400 font-medium">17.6</td>
                    <td className="py-3">超大模型训练</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 pr-4 font-medium text-white">NVIDIA 4090</td>
                    <td className="py-3 pr-4">24GB</td>
                    <td className="py-3 pr-4 text-gray-400 line-through">4.5</td>
                    <td className="py-3 pr-4 text-green-400 font-medium">3.6</td>
                    <td className="py-3">推理/小规模训练</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-white">NVIDIA A800</td>
                    <td className="py-3 pr-4">80GB</td>
                    <td className="py-3 pr-4 text-gray-400 line-through">10.0</td>
                    <td className="py-3 pr-4 text-green-400 font-medium">8.0</td>
                    <td className="py-3">模型训练/推理</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">* 价格为参考价，实际价格以服务商报价为准。包月/包年另有额外折扣。</p>
          </div>

          {/* CTA */}
          <div className="text-center py-6">
            <button
              onClick={() => { setShowChat(true); setChatMessages([]); }}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>🤖</span>
              <span>AI算力顾问 — 免费咨询算力方案</span>
            </button>
          </div>
        </div>
      ) : (
        /* AI Chat */
        <div className="flex flex-col h-[calc(100vh-140px)]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => { setShowChat(false); setChatMessages([]); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">返回</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h2 className="text-lg font-bold text-white">算力方案咨询</h2>
                <p className="text-xs text-gray-400">AI智能体为您提供算力需求评估与方案建议</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#131d2b] border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💡</div>
                  <p className="text-gray-400 text-sm">请描述您的算力需求，我将为您提供专业的方案建议</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[
                      "我需要训练一个7B参数的语言模型，需要什么配置？",
                      "推理服务怎么选最划算？",
                      "A100和H100有什么区别，我该选哪个？",
                      "如何降低算力使用成本？",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInputText(q)}
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
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-200"
                  }`}>
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

            <div className="border-t border-gray-700/50 p-4">
              <div className="flex gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="描述您的算力需求..."
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
              <p className="text-xs text-gray-500 mt-2">AI回答基于DeepSeek大模型，仅供参考。实际价格以服务商报价为准。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
