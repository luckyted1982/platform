import { useState } from "react";

const CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "policy", label: "政策解读" },
  { id: "ip", label: "知识产权" },
  { id: "qualification", label: "资质申报" },
  { id: "rd", label: "研发管理" },
  { id: "capital", label: "资本融资" },
  { id: "legal", label: "法律合规" },
  { id: "ai", label: "AI转型" },
];

const KNOWLEDGE_DATA = [
  { id: 1, title: "高新技术企业认定条件与申报流程详解（2025版）", category: "qualification", tags: ["高企认定", "税收优惠", "申报流程"], author: "智源研究院", views: 2341, content: "高新技术企业认定是科技型企业最重要的资质之一..." },
  { id: 2, title: "研发费用加计扣除政策要点与归集规范", category: "rd", tags: ["加计扣除", "研发费用", "财税政策"], author: "财税服务中心", views: 1892, content: "研发费用加计扣除是国家支持科技创新的重要财税政策..." },
  { id: 3, title: "专精特新「小巨人」企业认定标准深度解读", category: "qualification", tags: ["专精特新", "小巨人", "认定标准"], author: "企业服务中心", views: 1567, content: "专精特新「小巨人」企业是国家级重点培育的优质中小企业..." },
  { id: 4, title: "专利布局策略：从技术到市场的护城河构建", category: "ip", tags: ["专利布局", "知识产权", "竞争策略"], author: "IP战略中心", views: 1234, content: "专利布局是企业技术创新保护的核心手段..." },
  { id: 5, title: "科技企业各阶段融资路径与估值方法", category: "capital", tags: ["融资", "估值", "资本路径"], author: "资本服务中心", views: 2103, content: "科技企业的融资路径通常包括种子轮、天使轮、Pre-A轮..." },
  { id: 6, title: "数据安全法与企业合规要求实务指南", category: "legal", tags: ["数据安全", "合规", "法律风险"], author: "法律服务中心", views: 987, content: "《数据安全法》和《个人信息保护法》的实施对企业提出了..." },
  { id: 7, title: "AI For Science：科学研究的新范式", category: "ai", tags: ["AI", "科学研究", "新范式"], author: "AI研究中心", views: 1456, content: "AI For Science正在改变科学研究的方式..." },
  { id: 8, title: "2025年科技型中小企业评价入库操作指南", category: "qualification", tags: ["科小", "入库", "评价指标"], author: "企业服务中心", views: 876, content: "科技型中小企业评价入库是获取政策支持的入门资质..." },
  { id: 9, title: "知识产权贯标（GB/T 29490）实施全流程", category: "ip", tags: ["贯标", "知识产权", "管理体系"], author: "IP战略中心", views: 654, content: "知识产权贯标是企业知识产权管理规范化的重要标志..." },
  { id: 10, title: "ESG治理与科技企业可持续发展", category: "legal", tags: ["ESG", "治理", "可持续发展"], author: "法律服务中心", views: 543, content: "ESG（环境、社会和治理）已成为全球企业评价的重要维度..." },
  { id: 11, title: "产学研合作模式与科技成果转化路径", category: "rd", tags: ["产学研", "成果转化", "合作模式"], author: "产学研中心", views: 1123, content: "产学研合作是推动科技成果转化的重要途径..." },
  { id: 12, title: "政府引导基金申报与对接实务", category: "capital", tags: ["政府基金", "申报", "对接"], author: "资本服务中心", views: 789, content: "政府引导基金是科技初创企业重要的资金来源..." },
];

export function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<typeof KNOWLEDGE_DATA[0] | null>(null);

  const filtered = KNOWLEDGE_DATA.filter((k) => {
    if (activeCategory !== "all" && k.category !== activeCategory) return false;
    if (search && !k.title.toLowerCase().includes(search.toLowerCase()) && !k.tags.some((t) => t.includes(search))) return false;
    return true;
  });

  const catColor = (c: string) => {
    const map: Record<string, string> = { policy: "bg-blue-500/20 text-blue-400", ip: "bg-purple-500/20 text-purple-400", qualification: "bg-green-500/20 text-green-400", rd: "bg-cyan-500/20 text-cyan-400", capital: "bg-amber-500/20 text-amber-400", legal: "bg-red-500/20 text-red-400", ai: "bg-pink-500/20 text-pink-400" };
    return map[c] || "bg-gray-500/20 text-gray-400";
  };
  const catLabel = (c: string) => CATEGORIES.find((x) => x.id === c)?.label || c;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">知识库</h1>
        <p className="text-gray-400">政策解读、申报指南、行业洞察，助力企业决策</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索知识文章..."
            className="w-full bg-[#131d2b] border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500" />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                activeCategory === c.id ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-gray-800"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((article) => (
          <div key={article.id} onClick={() => setSelectedArticle(article)}
            className="bg-[#131d2b] border border-gray-700/50 rounded-xl p-5 hover:border-gray-500 cursor-pointer transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${catColor(article.category)}`}>{catLabel(article.category)}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {article.views}
              </span>
            </div>
            <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">{article.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded">{tag}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500">作者：{article.author}</p>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedArticle(null)}>
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[700px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full ${catColor(selectedArticle.category)}`}>{catLabel(selectedArticle.category)}</span>
              <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h2 className="text-xl font-bold mb-3">{selectedArticle.title}</h2>
            <div className="flex items-center gap-3 mb-6 text-xs text-gray-400">
              <span>作者：{selectedArticle.author}</span>
              <span>阅读量：{selectedArticle.views}</span>
            </div>
            <div className="flex gap-2 mb-6">
              {selectedArticle.tags.map((tag) => <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">{tag}</span>)}
            </div>
            <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">{selectedArticle.content}{"\n\n"}(更多详细内容可咨询AI科创助手或联系专属顾问)</div>
          </div>
        </div>
      )}
    </div>
  );
}
