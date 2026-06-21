import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { PARTNERS_DATA } from "@/data/companiesData";

const PARTNER_TYPES = [
  { value: "all", label: "全部" },
  { value: "research", label: "科研院所" },
  { value: "university", label: "高等院校" },
  { value: "enterprise", label: "龙头企业" },
  { value: "investment", label: "投资机构" },
  { value: "service", label: "专业服务机构" },
  { value: "government", label: "政府部门" },
];

export function PartnersPage() {
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", type: "", description: "", contactPerson: "", contactPhone: "" });

  const { data: partners } = trpc.platform.partnerList.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.platform.partnerCreate.useMutation({
    onSuccess: () => { utils.platform.partnerList.invalidate(); setShowForm(false); setFormData({ name: "", type: "", description: "", contactPerson: "", contactPhone: "" }); },
  });

  const allPartners = [...PARTNERS_DATA, ...(partners || []).filter((p) => !(p as any).isDefault)];
  const filtered = allPartners.filter((p) => filterType === "all" || p.type === filterType);

  const typeColor = (t: string) => {
    const map: Record<string, string> = {
      research: "bg-blue-500/20 text-blue-400",
      university: "bg-purple-500/20 text-purple-400",
      enterprise: "bg-green-500/20 text-green-400",
      investment: "bg-amber-500/20 text-amber-400",
      service: "bg-cyan-500/20 text-cyan-400",
      government: "bg-red-500/20 text-red-400",
    };
    return map[t] || "bg-gray-500/20 text-gray-400";
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      research: "科研院所", university: "高等院校", enterprise: "龙头企业",
      investment: "投资机构", service: "专业服务机构", government: "政府部门",
    };
    return map[t] || t;
  };

  const partnerIcon = (t: string) => {
    const map: Record<string, string> = {
      research: "🔬", university: "🎓", enterprise: "🏢",
      investment: "💰", service: "", government: "🏛️",
    };
    return map[t] || "";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">生态合作伙伴</h1>
          <p className="text-gray-400">构建产学研投政多方协同的创新服务生态</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors">
          + 添加合作伙伴
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {PARTNER_TYPES.map((t) => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === t.value ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:bg-gray-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "高等院校", value: allPartners.filter((p) => p.type === "university").length, color: "text-purple-400" },
          { label: "科研院所", value: allPartners.filter((p) => p.type === "research").length, color: "text-blue-400" },
          { label: "龙头企业", value: allPartners.filter((p) => p.type === "enterprise").length, color: "text-green-400" },
          { label: "投资机构", value: allPartners.filter((p) => p.type === "investment").length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#131d2b] rounded-xl border border-gray-700/50 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPartner(p)}
            className="bg-[#131d2b] border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center text-2xl">
                {partnerIcon(p.type)}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${typeColor(p.type)}`}>{typeLabel(p.type)}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">{p.name}</h3>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{p.description || "暂无描述"}</p>
            <div className="space-y-1 text-xs text-gray-500">
              {p.contactPerson && <p>联系人：{p.contactPerson}</p>}
              {p.contactPhone && <p>电话：{p.contactPhone}</p>}
              {p.cooperationScope && (
                <p className="text-cyan-400/70 mt-2 line-clamp-1">合作：{p.cooperationScope}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>暂无合作伙伴</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-amber-400 hover:text-amber-300 text-sm">添加第一个合作伙伴</button>
        </div>
      )}

      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedPartner(null)}>
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[650px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center text-3xl">
                  {partnerIcon(selectedPartner.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPartner.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${typeColor(selectedPartner.type)}`}>{typeLabel(selectedPartner.type)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">机构简介</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedPartner.description || "暂无描述"}</p>
              </div>
              {selectedPartner.cooperationScope && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">合作方向</h3>
                  <p className="text-sm text-cyan-300">{selectedPartner.cooperationScope}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedPartner.contactPerson && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">联系人</h3>
                    <p className="text-sm text-gray-300">{selectedPartner.contactPerson}</p>
                  </div>
                )}
                {selectedPartner.contactPhone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">联系电话</h3>
                    <p className="text-sm text-gray-300">{selectedPartner.contactPhone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPartner(null)}
                className="flex-1 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setSelectedPartner(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-medium transition-colors"
              >
                联系合作
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[500px]">
            <h2 className="text-xl font-bold mb-6">添加合作伙伴</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">名称</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">类型</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500">
                  <option value="">请选择</option>
                  {PARTNER_TYPES.filter((t) => t.value !== "all").map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">描述</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">联系人</label>
                  <input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">联系电话</label>
                  <input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-[#0b1120] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">取消</button>
              <button onClick={() => formData.name && formData.type && createMutation.mutate(formData)}
                disabled={!formData.name || !formData.type}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-lg font-medium transition-colors">
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
