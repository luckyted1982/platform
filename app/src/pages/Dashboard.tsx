import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GRADE_CONFIG, DIMENSIONS } from '@/types/zeta';
import type { ProjectRecord } from '@/types/zeta';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { PlusCircle, ClipboardCheck, Activity, Cpu } from 'lucide-react';

interface Props {
  projects: ProjectRecord[];
}

export function Dashboard({ projects }: Props) {
  const total = projects.length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const hitlCount = projects.filter(p => p.status === 'hitl_review').length;
  
  const avgScores = DIMENSIONS.slice(0, 5).map(d => {
    const scores = projects.filter(p => p.result)
      .map(p => p.result!.dimensions.find(dim => dim.dimensionId === d.id)?.score || 0);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { dimension: d.name, score: Math.round(avg * 10) / 10, fullMark: 5 };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">ZETA-Score 仪表盘</h2>
        <p className="text-[#8A9BB0] mt-1">AI Agent驱动的AI-Infra早期项目评价系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8A9BB0] text-sm">已评价项目</p>
                <p className="text-3xl font-bold text-[#C9A96E] mt-1">{total}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-[#8A9BB0]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8A9BB0] text-sm">完成评价</p>
                <p className="text-3xl font-bold text-white mt-1">{completed}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8A9BB0] text-sm">待HITL审核</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{hitlCount}</p>
              </div>
              <Cpu className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-5 flex items-center justify-center h-full">
            <Link to="/new">
              <Button className="bg-[#C9A96E] hover:bg-[#B8995E] text-[#111A25] font-bold gap-2">
                <PlusCircle className="w-4 h-4" />
                新建评价
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 雷达图 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D] col-span-2">
          <CardHeader>
            <CardTitle className="text-white">维度平均得分</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={avgScores}>
                    <PolarGrid stroke="#2A3A4D" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8A9BB0', fontSize: 12 }} />
                    <Radar name="平均分" dataKey="score" stroke="#C9A96E" fill="#C9A96E" fillOpacity={0.2} strokeWidth={2} />
                    <Legend wrapperStyle={{ color: '#8A9BB0' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-[#8A9BB0]">
                暂无数据，请先创建评价
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最新评价 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader>
            <CardTitle className="text-white">最新评价</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map(p => (
                  <Link key={p.project.id} to={`/result/${p.project.id}`} className="block">
                    <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg border border-[#2A3A4D] hover:border-[#C9A96E]/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[180px]">{p.project.name}</p>
                        <p className="text-xs text-[#8A9BB0]">{p.project.industryLayer === 'base' ? '基础层' : p.project.industryLayer === 'platform' ? '平台层' : '应用层'}</p>
                      </div>
                      {p.result && (
                        <div className="text-right">
                          <span className="text-lg font-bold" style={{ color: GRADE_CONFIG[p.result.grade].color }}>
                            {p.result.grade}
                          </span>
                          <p className="text-xs text-[#8A9BB0]">{p.result.totalScore}分</p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-[#8A9BB0] py-12">
                <p>暂无评价记录</p>
                <Link to="/new" className="text-[#C9A96E] text-sm mt-2 inline-block">创建第一个评价</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
