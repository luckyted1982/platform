import { useState } from "react";
import { trpc } from "@/providers/trpc";

export function ProjectLibrary({ onViewProject }: { onViewProject: (p: any) => void }) {
  const { data: projects, isLoading } = trpc.project.list.useQuery();
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterChain, setFilterChain] = useState("all");

  const deleteMutation = trpc.project.delete.useMutation();
  const utils = trpc.useUtils();

  const filtered = projects?.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRating !== "all" && p.rating !== filterRating) return false;
    if (filterChain !== "all" && p.chainLevel !== filterChain) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此项目？")) return;
    await deleteMutation.mutateAsync({ id });
    utils.project.list.invalidate();
  };

  const ratingColor = (r?: string) => {
    switch (r) {
      case "S": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "A": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "B": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "C": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "D": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">项目库</h2>
      <p className="text-gray-400 mb-6">
        共 {projects?.length ?? 0} 个项目
      </p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目名称..."
            className="w-full bg-[#1e293b] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all">全部评级</option>
          <option value="S">S级</option>
          <option value="A">A级</option>
          <option value="B">B级</option>
          <option value="C">C级</option>
          <option value="D">D级</option>
        </select>
        <select
          value={filterChain}
          onChange={(e) => setFilterChain(e.target.value)}
          className="bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="all">全部层级</option>
          <option value="基础层">基础层</option>
          <option value="平台层">平台层</option>
          <option value="应用层">应用层</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-gray-500">加载中...</div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>暂无匹配的项目</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs text-gray-400 uppercase">
                <th className="px-6 py-4">项目名称</th>
                <th className="px-6 py-4">产业链层级</th>
                <th className="px-6 py-4">融资阶段</th>
                <th className="px-6 py-4">团队</th>
                <th className="px-6 py-4">TRL</th>
                <th className="px-6 py-4">评级</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((p) => (
                <tr key={p.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description?.slice(0, 60)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">{p.chainLevel || "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{p.fundingStage || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{p.teamSize ? `${p.teamSize}人` : "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{p.trl || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded border ${ratingColor(p.rating || undefined)}`}>
                      {p.rating || "?"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      p.status === "completed" ? "bg-green-500/20 text-green-400" :
                      p.status === "pending_review" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {p.status === "completed" ? "已完成" :
                       p.status === "pending_review" ? "待审核" : "草稿"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewProject(p)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                        title="查看详情"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
