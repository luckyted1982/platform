import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { COMPANIES_DATA, type CompanyData } from "@/data/companiesData";

// 学清嘉创C座企业调研数据（基于enterprise_research_report文档）
const XUEQING_RESEARCH = {
  overview: "学清嘉创大厦位于北京海淀区，是清华科技园核心区域的重要创新载体。C座共入驻15家企业，覆盖芯片设计、AI基础设施、自动驾驶、脑机接口、航天通信、工业软件等多个细分赛道。",
  stats: {
    totalCompanies: 15,
    aiInfraRelated: 7,
    fundedCompanies: 9,
    coreTargets: 4,
  },
  coreTargets: [
    {
      name: "北京光联芯科智能科技",
      stage: "A轮",
      industry: "芯片硬件/硅光CPO",
      matchLevel: "★★★★★",
      founded: "2024年",
      team: "MIT、清华、浙大、中科院、Marvell等",
      tech: "OIO（光输入/输出）片间光互连芯片，将光引擎与计算芯片共封装，实现电负责计算、光专注传输的架构革新。带宽提升两个数量级、能耗降低两个数量级。",
      funding: "A轮近5亿元（高榕创投、联想创投、基石资本领投，普洛斯隐山、君联资本、红杉中国、高瓴创投等跟投）",
      highlight: "国内光互连芯片赛道早期融资纪录，全链路国产化，已与多家头部GPU企业建立合作",
    },
    {
      name: "北京品驰医疗设备",
      stage: "C+轮/拟科创板IPO",
      industry: "脑机接口/神经调控",
      matchLevel: "★★★★★",
      founded: "2008年",
      team: "清华大学航天航空学院，李路明院士（清华大学校长）领衔",
      tech: "国内唯一能自主研发、生产并大规模临床应用脑起搏器的企业，打破美敦力20余年垄断。产品覆盖脑起搏器、迷走神经刺激器、脊髓刺激器等。",
      funding: "种子轮至C+轮多轮融资（水木创投、礼来亚洲基金、高瓴资本、君联资本、国风投基金、中金资本等）",
      highlight: "国家科技进步奖一等奖，神经调控技术国家工程实验室，员工415-424人",
    },
    {
      name: "北京轻舟智航智能技术",
      stage: "D轮",
      industry: "自动驾驶/通用物理AI",
      matchLevel: "★★★★★",
      founded: "2019年",
      team: "四人创始团队均来自Waymo，其他成员来自特斯拉、英伟达、Facebook，硕博占比近80%",
      tech: "从自动驾驶全面升级至通用物理AI，端到端大模型、世界模型、强化学习等技术路线。搭载车型突破100万台，NOA市场份额超21%。",
      funding: "D轮1亿美元（国内头部主机厂、宁波宁海兴泰合基金等），累计融资超十亿元",
      highlight: "2026年在德国慕尼黑设立欧洲总部，与高通深度合作，计划欧美日韩量产交付",
    },
    {
      name: "北京趋境科技",
      stage: "Pre-A轮",
      industry: "AI推理基础设施/TaaS",
      matchLevel: "★★★★★",
      founded: "2023年12月",
      team: "CEO艾智远（清华计算机博士），总裁武文洁（金融博士+CFA），董事长任旭阳（百度创业元老），首席科学顾问郑纬民院士",
      tech: "Token as a Service（TaaS）理念，ATaaS平台专注企业级AI推理。联合开源KTransformers（GitHub Star 1.7万），日均处理Token近万亿。",
      funding: "天使轮数千万（高瓴创投、Z基金领投），Pre-A轮数亿元（星连资本、华控科技领投）",
      highlight: "直接命中算力调度/运营投资方向，与智谱GLM、月之暗面Kimi等头部大模型企业合作",
    },
  ],
  highAttention: [
    {
      name: "杭州华望系统科技",
      stage: "Pre-B轮",
      industry: "AI+MBSE工业软件",
      matchLevel: "★★★★☆",
      founded: "2015年",
      team: "浙大CAD&CG国家重点实验室，董事长刘玉生教授，团队120+人，硕博超40%",
      tech: "自主研发M-Design系统建模平台（支持SysML v1/v2）、M-Require需求管理、M-Arch体系建模等，近30项发明专利和软著",
      funding: "Pre-B轮数千万（浙大友创、西湖科创投、银杏谷资本），估值超10亿元",
      highlight: "客户覆盖航天科技/科工、中核集团、华为等近百家国防航天及高端制造单位",
    },
    {
      name: "北京蓝塔光传智能科技",
      stage: "天使轮",
      industry: "星间激光通信/航天",
      matchLevel: "★★★★☆",
      founded: "2025年4月",
      team: "蓝箭航天董事长张昌武发起设立，汇聚航天工程、卫星通信、光通信终端专家",
      tech: "2025年3月完成国内首次在轨星间400Gbps超高速激光通信数据传输试验，通信距离640公里",
      funding: "注册资本1.61亿元（实收1.5亿元），蓝箭航天持股31.06%",
      highlight: "IEEE Spectrum深度报道，空天地一体化6G网络关键基础设施",
    },
  ],
  contactable: [
    {
      name: "北京中科智眼科技",
      stage: "天使轮",
      industry: "AI工业检测",
      matchLevel: "★★★☆☆",
      brief: "AI视觉检测技术，应用于工业质检场景",
    },
    {
      name: "北京心影随行科技",
      stage: "天使轮",
      industry: "AI陪伴/消费娱乐",
      matchLevel: "★★★☆☆",
      brief: "AI陪伴产品，面向消费娱乐市场",
    },
  ],
};

// 判断是否为COMPANIES_DATA中的企业（有详细信息）
function isCompaniesDataItem(c: any): c is CompanyData {
  return c && typeof c.founded === "string" && c.id < 1000;
}

export function CompaniesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", industry: "", stage: "" as string, scale: "", contact: "", phone: "", email: "", requirements: "" });
  const [filterStage, setFilterStage] = useState("all");

  const { data: companies } = trpc.platform.companyList.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.platform.companyCreate.useMutation({
    onSuccess: () => { utils.platform.companyList.invalidate(); setShowForm(false); setFormData({ name: "", industry: "", stage: "", scale: "", contact: "", phone: "", email: "", requirements: "" }); },
  });

  const allCompanies = [...COMPANIES_DATA, ...(companies || [])];
  const filtered = allCompanies.filter((c) => filterStage === "all" || c.stage === filterStage);

  const stageColor = (s?: string) => {
    const map: Record<string, string> = {
      seed: "bg-gray-500/20 text-gray-400", angel: "bg-blue-500/20 text-blue-400",
      pre_a: "bg-purple-500/20 text-purple-400", a: "bg-green-500/20 text-green-400",
      b_plus: "bg-amber-500/20 text-amber-400", established: "bg-red-500/20 text-red-400",
    };
    return map[s || ""] || "bg-gray-500/20 text-gray-400";
  };
  const stageLabel = (s?: string) => {
    const map: Record<string, string> = {
      seed: "种子期", angel: "天使期", pre_a: "Pre-A轮", a: "A轮", b_plus: "B轮+", established: "成熟期",
    };
    return map[s || ""] || s || "未标注";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">企业库</h1>
          <p className="text-gray-400">管理入驻企业信息，追踪服务需求与进度</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setSelectedCompany(null); setShowResearch(true); }}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
          >
            学清嘉创调研
          </button>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors">
            + 录入企业
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "seed", "angel", "pre_a", "a", "b_plus", "established"].map((s) => (
          <button key={s} onClick={() => setFilterStage(s)}
            className={`px-3 py-2 rounded-lg text-xs transition-colors ${
              filterStage === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-gray-800"
            }`}>
            {s === "all" ? "全部" : stageLabel(s)}
          </button>
        ))}
      </div>

      <div className="bg-[#131d2b] rounded-xl border border-gray-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-left text-xs text-gray-400 uppercase">
              <th className="px-6 py-4">企业名称</th>
              <th className="px-6 py-4">行业</th>
              <th className="px-6 py-4">阶段</th>
              <th className="px-6 py-4">规模</th>
              <th className="px-6 py-4">联系人</th>
              <th className="px-6 py-4">状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-500">暂无企业</td></tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => { setSelectedCompany(c); setShowResearch(true); }}
                  className="border-b border-gray-700/50 last:border-0 hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{c.name}</p>
                      {(c as any).isResearchTarget && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">调研</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{c.industry ?? "—"}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${stageColor(c.stage ?? undefined)}`}>{stageLabel(c.stage ?? undefined)}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-300">{c.scale || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{c.contact || "—"}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${c.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{c.status === "active" ? "活跃" : c.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">录入企业</h2>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">企业名称 *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-1">所属行业</label>
                  <input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">发展阶段</label>
                  <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500">
                    <option value="">请选择</option><option value="seed">种子期</option><option value="angel">天使期</option><option value="pre_a">Pre-A轮</option><option value="a">A轮</option><option value="b_plus">B轮+</option><option value="established">成熟期</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-1">企业规模</label>
                  <input value={formData.scale} onChange={(e) => setFormData({ ...formData, scale: e.target.value })} placeholder="如：50-100人" className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">联系人</label>
                  <input value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-1">联系电话</label>
                  <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">邮箱</label>
                  <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div><label className="block text-sm text-gray-400 mb-1">服务需求</label>
                <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={3} className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800">取消</button>
              <button onClick={() => formData.name && createMutation.mutate(formData)} disabled={!formData.name} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-lg font-medium">录入</button>
            </div>
          </div>
        </div>
      )}

      {/* Research Detail Modal / Company Detail Modal */}
      {showResearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowResearch(false)}>
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl w-[900px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#131d2b] border-b border-gray-700 px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedCompany && isCompaniesDataItem(selectedCompany)
                    ? selectedCompany.name
                    : selectedCompany?.isResearchTarget
                      ? "学清嘉创大厦C座 — 企业调研报告"
                      : selectedCompany?.name || "企业详情"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedCompany && isCompaniesDataItem(selectedCompany)
                    ? "基于汇总台账与学清嘉创企业单页分析报告"
                    : "基于enterprise_research_report文档整理"}
                </p>
              </div>
              <button onClick={() => setShowResearch(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {selectedCompany && isCompaniesDataItem(selectedCompany) ? (
                /* Company Detail View */
                <div>
                  {/* Header badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`text-xs px-2 py-1 rounded-full ${stageColor(selectedCompany.stage)}`}>{stageLabel(selectedCompany.stage)}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">{selectedCompany.industry}</span>
                    {selectedCompany.attentionLevel && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">{selectedCompany.attentionLevel}</span>
                    )}
                    {selectedCompany.aiInfra && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">AI Infra</span>
                    )}
                  </div>

                  {/* Basic info grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedCompany.founded && (
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-500 text-xs mb-1">成立时间</p>
                        <p className="text-sm text-gray-300">{selectedCompany.founded}</p>
                      </div>
                    )}
                    {selectedCompany.teamSize && (
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-500 text-xs mb-1">团队规模</p>
                        <p className="text-sm text-gray-300">{selectedCompany.teamSize}</p>
                      </div>
                    )}
                    {selectedCompany.sector && (
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-500 text-xs mb-1">细分领域</p>
                        <p className="text-sm text-gray-300">{selectedCompany.sector}</p>
                      </div>
                    )}
                    {selectedCompany.companyType && (
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-500 text-xs mb-1">企业类型</p>
                        <p className="text-sm text-gray-300">{selectedCompany.companyType}</p>
                      </div>
                    )}
                  </div>

                  {/* Business info */}
                  <div className="space-y-4 mb-6">
                    {selectedCompany.businessDirection && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">业务方向</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.businessDirection}</p>
                      </div>
                    )}
                    {selectedCompany.industryChainPosition && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">产业链位置</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.industryChainPosition}</p>
                      </div>
                    )}
                    {selectedCompany.products && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">核心产品</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.products}</p>
                      </div>
                    )}
                    {selectedCompany.marketStatus && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">市场地位</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.marketStatus}</p>
                      </div>
                    )}
                    {selectedCompany.businessProgress && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">业务进展</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.businessProgress}</p>
                      </div>
                    )}
                    {selectedCompany.coreCustomers && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">核心客户</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.coreCustomers}</p>
                      </div>
                    )}
                  </div>

                  {/* Investment */}
                  <div className="space-y-4 mb-6">
                    {selectedCompany.investmentStatus && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">融资情况</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.investmentStatus}</p>
                      </div>
                    )}
                    {selectedCompany.investmentValue && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">投资价值评估</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.investmentValue}</p>
                      </div>
                    )}
                  </div>

                  {/* Highlights & Risks */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedCompany.highlights && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                        <p className="text-amber-400 text-xs font-medium mb-1">亮点</p>
                        <p className="text-amber-300/80 text-sm">{selectedCompany.highlights}</p>
                      </div>
                    )}
                    {selectedCompany.risks && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-400 text-xs font-medium mb-1">风险</p>
                        <p className="text-red-300/80 text-sm">{selectedCompany.risks}</p>
                      </div>
                    )}
                  </div>

                  {/* Patents & Competitors */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCompany.patents && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">知识产权</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.patents}</p>
                      </div>
                    )}
                    {selectedCompany.competitors && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">竞争对手</h3>
                        <p className="text-sm text-gray-300">{selectedCompany.competitors}</p>
                      </div>
                    )}
                  </div>

                  {/* Requirements */}
                  {selectedCompany.requirements && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">服务需求</h3>
                      <p className="text-sm text-cyan-300">{selectedCompany.requirements}</p>
                    </div>
                  )}
                </div>
              ) : selectedCompany?.isResearchTarget ? (
                <>
                  {/* Overview */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3">调研概述</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{XUEQING_RESEARCH.overview}</p>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-amber-400">{XUEQING_RESEARCH.stats.totalCompanies}</p>
                        <p className="text-xs text-gray-400 mt-1">入驻企业总数</p>
                      </div>
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">{XUEQING_RESEARCH.stats.aiInfraRelated}</p>
                        <p className="text-xs text-gray-400 mt-1">AI Infra相关</p>
                      </div>
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{XUEQING_RESEARCH.stats.fundedCompanies}</p>
                        <p className="text-xs text-gray-400 mt-1">已获融资</p>
                      </div>
                      <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-400">{XUEQING_RESEARCH.stats.coreTargets}</p>
                        <p className="text-xs text-gray-400 mt-1">核心标的</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Targets */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-amber-400">★★★★★</span> 核心标的组
                    </h3>
                    <div className="space-y-4">
                      {XUEQING_RESEARCH.coreTargets.map((company, idx) => (
                        <div key={idx} className="bg-[#0b1120]/60 border border-gray-700/50 rounded-xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-white text-base">{company.name}</h4>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">{company.stage}</span>
                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{company.industry}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">成立时间</p>
                              <p className="text-gray-300">{company.founded}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">核心团队</p>
                              <p className="text-gray-300">{company.team}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-gray-500 text-xs mb-1">核心技术</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{company.tech}</p>
                          </div>
                          <div className="mt-3">
                            <p className="text-gray-500 text-xs mb-1">融资情况</p>
                            <p className="text-gray-300 text-sm">{company.funding}</p>
                          </div>
                          <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                            <p className="text-amber-400 text-xs font-medium mb-1">亮点</p>
                            <p className="text-amber-300/80 text-sm">{company.highlight}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Attention */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-blue-400">★★★★☆</span> 高度关注组
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {XUEQING_RESEARCH.highAttention.map((company, idx) => (
                        <div key={idx} className="bg-[#0b1120]/60 border border-gray-700/50 rounded-xl p-5">
                          <h4 className="font-bold text-white text-sm mb-2">{company.name}</h4>
                          <div className="flex gap-2 mb-3">
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{company.stage}</span>
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">{company.industry}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">团队</p>
                          <p className="text-sm text-gray-300 mb-2">{company.team}</p>
                          <p className="text-xs text-gray-500 mb-1">技术</p>
                          <p className="text-sm text-gray-300 mb-2">{company.tech}</p>
                          <p className="text-xs text-gray-500 mb-1">融资</p>
                          <p className="text-sm text-gray-300">{company.funding}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contactable */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-green-400">★★★☆☆</span> 可接触企业
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {XUEQING_RESEARCH.contactable.map((company, idx) => (
                        <div key={idx} className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                          <h4 className="font-medium text-white text-sm mb-1">{company.name}</h4>
                          <div className="flex gap-2 mb-2">
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">{company.stage}</span>
                            <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">{company.industry}</span>
                          </div>
                          <p className="text-xs text-gray-400">{company.brief}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <p>企业详情待完善</p>
                  <p className="text-sm mt-2">点击"学清嘉创调研"按钮查看完整调研报告</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
