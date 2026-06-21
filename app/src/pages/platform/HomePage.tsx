import { Link } from "react-router";

const stats = [
  { label: "入驻企业", value: "300+", color: "text-amber-400" },
  { label: "服务订单", value: "1,200+", color: "text-blue-400" },
  { label: "合作伙伴", value: "80+", color: "text-green-400" },
  { label: "知识文章", value: "500+", color: "text-purple-400" },
];

const serviceHighlights = [
  {
    icon: "⚙️",
    title: "研发管理与技术创新",
    desc: "技术路线规划、IPD+敏捷融合、研发经费加计扣除",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: "🛡️",
    title: "知识产权战略",
    desc: "专利布局、贯标辅导、高价值专利培育",
    color: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: "🏆",
    title: "资质梯度培育",
    desc: "科小入库、高企认定、专精特新小巨人",
    color: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: "💰",
    title: "资本路径设计",
    desc: "估值诊断、融资规划、FA对接、基金引荐",
    color: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: "🤝",
    title: "产学研合作",
    desc: "POC中心、技术经理人、成果评估转化",
    color: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: "⚖️",
    title: "法律风险防控",
    desc: "股权架构、合规体系、ESG治理",
    color: "bg-red-500/10 border-red-500/20",
  },
];

const news = [
  { title: "2025年高新技术企业认定政策解读", date: "2025-06-18", tag: "政策" },
  { title: "专精特新「小巨人」申报要点与常见问题", date: "2025-06-15", tag: "资质" },
  { title: "智源嘉创与清华大学技术转移研究院达成战略合作", date: "2025-06-10", tag: "合作" },
  { title: "AI赋能知识产权：智能专利分析工具上线", date: "2025-06-08", tag: "产品" },
];

export function HomePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0f1923] via-[#131d2b] to-[#1a2332] rounded-2xl border border-gray-700/50 p-10 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium border border-amber-500/20">AI Native 驱动</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/20">全生命周期</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white">智源嘉创科技服务平台</h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            基于AI Native理念搭建的一站式科技企业赋能平台，为企业提供研发管理、知识产权、资质培育、资本路径、产学研合作、法律风控、AI转型、算力服务与智能评价的全方位服务
          </p>
          <div className="flex gap-4">
            <Link to="/platform/services" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors">
              探索服务矩阵
            </Link>
            <Link to="/platform/companies" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors">
              企业入驻
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#131d2b] rounded-xl border border-gray-700/50 p-6 text-center">
            <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-sm text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Service Highlights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">核心服务</h2>
          <Link to="/platform/services" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
            查看全部 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {serviceHighlights.map((s) => (
            <Link key={s.title} to="/platform/services" className={`${s.color} border rounded-xl p-5 hover:scale-[1.02] transition-transform`}>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-6">
        {/* News */}
        <div className="bg-[#131d2b] rounded-xl border border-gray-700/50 p-6">
          <h2 className="text-lg font-bold mb-4">最新动态</h2>
          <div className="space-y-4">
            {news.map((n, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-700/50 last:border-0 last:pb-0">
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded mt-0.5 ${
                  n.tag === "政策" ? "bg-blue-500/20 text-blue-400" :
                  n.tag === "资质" ? "bg-green-500/20 text-green-400" :
                  n.tag === "合作" ? "bg-purple-500/20 text-purple-400" :
                  "bg-amber-500/20 text-amber-400"
                }`}>{n.tag}</span>
                <div>
                  <p className="text-sm text-gray-200 hover:text-amber-400 cursor-pointer transition-colors">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Entry */}
        <div className="bg-[#131d2b] rounded-xl border border-gray-700/50 p-6">
          <h2 className="text-lg font-bold mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "高企认定申报", path: "/platform/services", icon: "📋", color: "bg-blue-500/10 text-blue-400" },
              { label: "专精特新培育", path: "/platform/services", icon: "🏆", color: "bg-green-500/10 text-green-400" },
              { label: "融资FA对接", path: "/platform/services", icon: "💼", color: "bg-amber-500/10 text-amber-400" },
              { label: "知识产权布局", path: "/platform/services", icon: "📝", color: "bg-purple-500/10 text-purple-400" },
              { label: "产学研合作", path: "/platform/services", icon: "🔬", color: "bg-cyan-500/10 text-cyan-400" },
              { label: "AI转型咨询", path: "/platform/services", icon: "🤖", color: "bg-pink-500/10 text-pink-400" },
            ].map((item) => (
              <Link key={item.label} to={item.path} className={`${item.color} bg-opacity-10 rounded-lg p-3 border border-gray-700/30 hover:scale-[1.02] transition-transform`}>
                <span className="text-xl mb-1 block">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
