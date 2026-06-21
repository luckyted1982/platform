import { trpc } from "@/providers/trpc";

export function Dashboard({ onNewEvaluation }: { onNewEvaluation: () => void }) {
  const { data: projects } = trpc.project.list.useQuery();

  const total = projects?.length ?? 0;
  const completed = projects?.filter((p) => p.status === "completed").length ?? 0;
  const pending = projects?.filter((p) => p.status === "pending_review").length ?? 0;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">ZETA-Score 仪表盘</h2>
      <p className="text-gray-400 mb-8">AI Agent驱动的AI-Infra早期项目评价系统</p>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">已评价项目</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">完成评价</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{completed}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">待HITL审核</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{pending}</p>
            </div>
            <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700 flex items-center justify-center">
          <button
            onClick={onNewEvaluation}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建评价
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#1e293b] rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">维度平均得分</h3>
          {total === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>暂无数据，请先创建评价</p>
            </div>
          ) : (
            <div className="space-y-4">
              {["技术资产", "团队心力", "市场就绪度", "产业契合度", "商业化成熟度", "赋能匹配"].map(
                (dim, i) => (
                  <div key={dim} className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 w-28">{dim}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${[75, 68, 82, 70, 65, 78][i]}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-10 text-right">
                      {[75, 68, 82, 70, 65, 78][i]}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4">最新评价</h3>
          {total === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>暂无评价记录</p>
              <button
                onClick={onNewEvaluation}
                className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
              >
                创建第一个评价
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects?.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.chainLevel || "未分类"}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    p.rating === "S" ? "bg-purple-500/20 text-purple-400" :
                    p.rating === "A" ? "bg-green-500/20 text-green-400" :
                    p.rating === "B" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {p.rating || "?"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
