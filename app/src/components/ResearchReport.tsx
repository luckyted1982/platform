import { useState } from "react";
import { trpc } from "@/providers/trpc";

interface ResearchReportProps {
  result: any;
}

const FUND_DIRECTIONS = [
  "存算一体", "RISC-V", "硅光/CPO", "AI硬件", "芯片液冷", "热界面材料",
  "冷却微泵", "快接头/阀", "微通道MLCP", "相变换热", "冷却液材料",
  "液态金属", "3D打印冷却", "高压直流", "PSU电源", "Sidecar",
  "电力控制", "氮化镓", "固态变压器SST", "固态电池", "电池监控",
  "燃气轮机", "液化天然气LNG", "源网荷储", "算电协同", "量子冷却",
  "太空算力", "超导磁体", "可控核聚变", "算力运营", "边缘计算",
  "数据运营", "资产运营", "算力调度", "MLOps", "具身数据",
  "仿真训练", "AI For Science", "物理AI", "Agent OS", "AI+行业",
];

const INSTITUTE_CAPABILITIES = [
  "AI共生平台", "AI For Science", "AI For Patent",
  "创新中心（联合实验室/算力中心）", "赋能中心（首台套/生产共享）",
];

export function ResearchReport({ result }: ResearchReportProps) {
  const [activeTab, setActiveTab] = useState<"report" | "dimensions">("report");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showEvalPanel, setShowEvalPanel] = useState(false);
  const [evalScores, setEvalScores] = useState({
    techAssets: 75,
    teamStrength: 68,
    marketReadiness: 82,
    industryFit: 70,
    commercialMaturity: 65,
    empowermentMatch: 78,
  });

  const fd = result.fourDimensions || {};
  const [basicInfo, setBasicInfo] = useState({
    companyName: fd.basicInfo?.companyName || result.projectName || "",
    foundedYear: fd.basicInfo?.foundedYear || "",
    location: fd.basicInfo?.location || "",
    businessModel: fd.basicInfo?.businessModel || "",
    chainLevel: fd.basicInfo?.chainLevel || "",
    fundingStage: fd.fundingStage || "",
    founderBackground: fd.basicInfo?.founderBackground || "",
    description: "",
  });

  const [techTeam, setTechTeam] = useState({
    coreTech: fd.techAndTeam?.coreTech || "",
    techBarrier: fd.techAndTeam?.techBarrier || "",
    teamSize: fd.techAndTeam?.teamSize?.toString() || "",
    patents: fd.techAndTeam?.patents?.toString() || "",
    trl: fd.techAndTeam?.trl?.toString() || "",
    mrl: fd.techAndTeam?.mrl?.toString() || "",
    rdBackground: fd.techAndTeam?.rdBackground || "",
    teamBackground: "",
  });

  const [market, setMarket] = useState({
    tam: fd.marketAndCompetition?.tam?.toString() || "",
    sam: fd.marketAndCompetition?.sam?.toString() || "",
    som: fd.marketAndCompetition?.som?.toString() || "",
    targetMarket: fd.marketAndCompetition?.targetMarket || "",
    competitors: fd.marketAndCompetition?.competitors || "",
    differentiation: fd.marketAndCompetition?.differentiation || "",
    payingCustomers: fd.marketAndCompetition?.payingCustomers || "",
    growthDrivers: fd.marketAndCompetition?.growthDrivers || "",
  });

  const [investment, setInvestment] = useState({
    fundDirections: fd.investmentFit?.fundDirections || [],
    instituteCapabilities: fd.investmentFit?.instituteCapabilities || [],
    cooperationScenarios: fd.investmentFit?.cooperationScenarios || "",
    valueCreation: fd.investmentFit?.valueCreation || "",
  });

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await createMutation.mutateAsync({
        name: basicInfo.companyName || result.projectName,
        description: basicInfo.description || basicInfo.businessModel,
        chainLevel: basicInfo.chainLevel,
        fundingStage: basicInfo.fundingStage,
        teamBackground: techTeam.teamBackground || techTeam.rdBackground,
        coreTech: techTeam.coreTech,
        teamSize: techTeam.teamSize ? parseInt(techTeam.teamSize) : undefined,
        patents: techTeam.patents ? parseInt(techTeam.patents) : undefined,
        trl: techTeam.trl ? parseInt(techTeam.trl) : undefined,
        mrl: techTeam.mrl ? parseInt(techTeam.mrl) : undefined,
        tam: market.tam || undefined,
        sam: market.sam || undefined,
        som: market.som || undefined,
        differentiation: market.differentiation,
        competitors: market.competitors,
        payingCustomers: market.payingCustomers,
        fundDirections: investment.fundDirections,
        instituteCapabilities: investment.instituteCapabilities,
      });
    } catch {
      setSaveStatus("error");
    }
  };

  const handleEvaluate = () => {
    setShowEvalPanel(true);
  };

  const calculateOverall = () => {
    const weights = { techAssets: 0.30, teamStrength: 0.25, marketReadiness: 0.20, industryFit: 0.15, commercialMaturity: 0.10 };
    let score = 0;
    score += evalScores.techAssets * weights.techAssets;
    score += evalScores.teamStrength * weights.teamStrength;
    score += evalScores.marketReadiness * weights.marketReadiness;
    score += evalScores.industryFit * weights.industryFit;
    score += evalScores.commercialMaturity * weights.commercialMaturity;
    score += Math.min(evalScores.empowermentMatch, 15);
    return Math.round(score);
  };

  const getRating = (score: number) => {
    if (score >= 90) return "S";
    if (score >= 75) return "A";
    if (score >= 60) return "B";
    if (score >= 45) return "C";
    return "D";
  };

  const overallScore = calculateOverall();
  const rating = getRating(overallScore);

  const toggleSelection = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const DimensionCard = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
    <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
      <div className={`px-5 py-3 border-b border-gray-700 ${color}`}>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, type = "text", placeholder = "" }: {
    label: string; value: string; onChange?: (v: string) => void; type?: "text" | "number" | "textarea"; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {isEditing && onChange ? (
        type === "textarea" ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 min-h-[60px]" />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
        )
      ) : (
        <p className="text-sm text-gray-300">{value || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">调研报告：{result.projectName}</h2>
          <p className="text-gray-400 text-sm mt-1">
            由 DeepSeek AI Agent 自动生成 · 所有信息可手动修改
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {saveStatus === "saved" && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              保存成功
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-400">保存失败，请重试</span>
          )}
          <button onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}>
            {isEditing ? "完成编辑" : "编辑信息"}
          </button>
          <button onClick={handleSave} disabled={saveStatus === "saving"}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg text-sm transition-colors disabled:opacity-50">
            {saveStatus === "saving" ? "保存中..." : "保存到项目库"}
          </button>
          <button onClick={handleEvaluate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            开始ZETA-Score评价
          </button>
        </div>
      </div>

      {/* ZETA-Score Evaluation Panel */}
      {showEvalPanel && (
        <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">ZETA-Score 评价面板</h3>
            <button onClick={() => setShowEvalPanel(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-4 mb-6">
            {[
              { key: "techAssets", label: "技术资产", weight: "30%", max: 100 },
              { key: "teamStrength", label: "团队心力", weight: "25%", max: 100 },
              { key: "marketReadiness", label: "市场就绪度", weight: "20%", max: 100 },
              { key: "industryFit", label: "产业契合度", weight: "15%", max: 100 },
              { key: "commercialMaturity", label: "商业化成熟度", weight: "10%", max: 100 },
              { key: "empowermentMatch", label: "赋能匹配", weight: "+15分", max: 15 },
            ].map((dim) => (
              <div key={dim.key} className="text-center">
                <label className="block text-xs text-gray-300 mb-1">{dim.label}</label>
                <span className="text-xs text-gray-500">({dim.weight})</span>
                <input
                  type="number"
                  min={0}
                  max={dim.max}
                  value={evalScores[dim.key as keyof typeof evalScores]}
                  onChange={(e) => setEvalScores({ ...evalScores, [dim.key]: parseInt(e.target.value) || 0 })}
                  className="w-full mt-2 bg-[#0f172a] border border-gray-600 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">综合评分</p>
              <p className="text-4xl font-bold text-white">{overallScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">评级</p>
              <span className={`text-3xl font-bold px-4 py-1 rounded-lg ${
                rating === "S" ? "bg-purple-500 text-white" :
                rating === "A" ? "bg-green-500 text-white" :
                rating === "B" ? "bg-blue-500 text-white" :
                rating === "C" ? "bg-yellow-500 text-black" :
                "bg-red-500 text-white"
              }`}>{rating}</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">评级标准</p>
              <p className="text-xs text-gray-500">S(90+) A(75+) B(60+) C(45+) D(&lt;45)</p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                alert(`评价结果：${result.projectName}\n综合评分：${overallScore}\n评级：${rating}\n\n评价已记录，可保存到项目库。`);
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              确认评价结果
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1e293b] rounded-lg p-1 mb-6 w-fit border border-gray-700">
        <button onClick={() => setActiveTab("report")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "report" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
          }`}>调研报告</button>
        <button onClick={() => setActiveTab("dimensions")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "dimensions" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
          }`}>四方面信息</button>
      </div>

      {/* Content */}
      {activeTab === "report" ? (
        <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-8">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-line text-gray-300 leading-relaxed">{result.report}</div>
          </div>
          {result.sources && result.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">信息来源</h4>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((s: string, i: number) => (
                  <span key={i} className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* 维度1：基础信息 */}
          <DimensionCard title="1. 基础信息" color="bg-blue-600/20">
            <Field label="公司名称" value={basicInfo.companyName} onChange={(v) => setBasicInfo({ ...basicInfo, companyName: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="成立时间" value={basicInfo.foundedYear} onChange={(v) => setBasicInfo({ ...basicInfo, foundedYear: v })} />
              <Field label="注册地" value={basicInfo.location} onChange={(v) => setBasicInfo({ ...basicInfo, location: v })} />
            </div>
            <Field label="商业模式" value={basicInfo.businessModel} onChange={(v) => setBasicInfo({ ...basicInfo, businessModel: v })} type="textarea" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="产业链层级" value={basicInfo.chainLevel} onChange={(v) => setBasicInfo({ ...basicInfo, chainLevel: v })} />
              <Field label="融资阶段" value={basicInfo.fundingStage} onChange={(v) => setBasicInfo({ ...basicInfo, fundingStage: v })} />
            </div>
            <Field label="创始人背景" value={basicInfo.founderBackground} onChange={(v) => setBasicInfo({ ...basicInfo, founderBackground: v })} type="textarea" />
            <Field label="项目简介" value={basicInfo.description} onChange={(v) => setBasicInfo({ ...basicInfo, description: v })} type="textarea" placeholder="补充项目描述..." />
          </DimensionCard>

          {/* 维度2：技术与团队 */}
          <DimensionCard title="2. 技术与团队" color="bg-purple-600/20">
            <Field label="核心技术" value={techTeam.coreTech} onChange={(v) => setTechTeam({ ...techTeam, coreTech: v })} type="textarea" />
            <Field label="技术壁垒" value={techTeam.techBarrier} onChange={(v) => setTechTeam({ ...techTeam, techBarrier: v })} type="textarea" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="团队规模" value={techTeam.teamSize} onChange={(v) => setTechTeam({ ...techTeam, teamSize: v })} type="number" />
              <Field label="专利数量" value={techTeam.patents} onChange={(v) => setTechTeam({ ...techTeam, patents: v })} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="TRL成熟度 (1-9)" value={techTeam.trl} onChange={(v) => setTechTeam({ ...techTeam, trl: v })} type="number" />
              <Field label="MRL就绪度 (1-10)" value={techTeam.mrl} onChange={(v) => setTechTeam({ ...techTeam, mrl: v })} type="number" />
            </div>
            <Field label="研发团队背景" value={techTeam.rdBackground} onChange={(v) => setTechTeam({ ...techTeam, rdBackground: v })} type="textarea" />
            <Field label="核心团队背景" value={techTeam.teamBackground} onChange={(v) => setTechTeam({ ...techTeam, teamBackground: v })} type="textarea" placeholder="补充团队信息..." />
          </DimensionCard>

          {/* 维度3：市场与竞争 */}
          <DimensionCard title="3. 市场与竞争" color="bg-green-600/20">
            <div className="grid grid-cols-3 gap-4">
              <Field label="TAM (亿元)" value={market.tam} onChange={(v) => setMarket({ ...market, tam: v })} type="number" />
              <Field label="SAM (亿元)" value={market.sam} onChange={(v) => setMarket({ ...market, sam: v })} type="number" />
              <Field label="SOM (亿元)" value={market.som} onChange={(v) => setMarket({ ...market, som: v })} type="number" />
            </div>
            <Field label="目标市场" value={market.targetMarket} onChange={(v) => setMarket({ ...market, targetMarket: v })} />
            <Field label="主要竞争对手" value={market.competitors} onChange={(v) => setMarket({ ...market, competitors: v })} type="textarea" />
            <Field label="差异化策略" value={market.differentiation} onChange={(v) => setMarket({ ...market, differentiation: v })} type="textarea" />
            <Field label="已有付费客户" value={market.payingCustomers} onChange={(v) => setMarket({ ...market, payingCustomers: v })} type="textarea" />
            <Field label="增长驱动因素" value={market.growthDrivers} onChange={(v) => setMarket({ ...market, growthDrivers: v })} type="textarea" />
          </DimensionCard>

          {/* 维度4：投资方向与赋能匹配 */}
          <DimensionCard title="4. 投资方向与赋能匹配" color="bg-amber-600/20">
            <div>
              <label className="block text-xs text-gray-400 mb-2">基金投资方向（多选）</label>
              <div className="flex flex-wrap gap-2">
                {FUND_DIRECTIONS.map((d) => (
                  <button key={d} onClick={() => isEditing && toggleSelection(investment.fundDirections, d, (v) => setInvestment({ ...investment, fundDirections: v }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      investment.fundDirections.includes(d) ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                    } ${!isEditing && "cursor-default"}`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">研究院赋能板块（多选）</label>
              <div className="flex flex-wrap gap-2">
                {INSTITUTE_CAPABILITIES.map((c) => (
                  <button key={c} onClick={() => isEditing && toggleSelection(investment.instituteCapabilities, c, (v) => setInvestment({ ...investment, instituteCapabilities: v }))}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      investment.instituteCapabilities.includes(c) ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                    } ${!isEditing && "cursor-default"}`}>{c}</button>
                ))}
              </div>
            </div>
            <Field label="潜在合作场景" value={investment.cooperationScenarios} onChange={(v) => setInvestment({ ...investment, cooperationScenarios: v })} type="textarea" />
            <Field label="价值创造点" value={investment.valueCreation} onChange={(v) => setInvestment({ ...investment, valueCreation: v })} type="textarea" />
          </DimensionCard>
        </div>
      )}
    </div>
  );
}
