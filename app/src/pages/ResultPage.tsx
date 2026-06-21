import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GRADE_CONFIG, DIMENSIONS, STAGE_LABELS, LAYER_LABELS } from '@/types/zeta';
import type { ProjectRecord, DimensionScore } from '@/types/zeta';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowLeft, Edit3, FileText, AlertTriangle, ThumbsUp } from 'lucide-react';

interface Props {
  projects: ProjectRecord[];
  onUpdate: (id: string, updates: Partial<ProjectRecord>) => void;
}

export function ResultPage({ projects, onUpdate }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const record = projects.find(p => p.project.id === id);

  if (!record || !record.result) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="bg-[#1A2535] border-[#2A3A4D] p-8 text-center">
          <p className="text-[#8A9BB0]">评价结果不存在或尚未完成</p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-[#C9A96E] text-[#111A25]">
            返回仪表盘
          </Button>
        </Card>
      </div>
    );
  }

  const { project, result } = record;
  const gradeConfig = GRADE_CONFIG[result.grade];
  const mainDimensions = result.dimensions.filter(d => d.dimensionId !== 'd6');
  const d6Dimension = result.dimensions.find(d => d.dimensionId === 'd6');

  const radarData = mainDimensions.map(d => ({
    dimension: d.dimensionName.slice(0, 4),
    fullName: d.dimensionName,
    score: d.score,
    fullMark: 5,
  }));

  const barData = mainDimensions.flatMap(d => 
    d.subScores.map(s => ({
      name: s.subName.slice(0, 8),
      score: s.score,
      dimension: d.dimensionName,
    }))
  );

  const handleApproveHITL = () => {
    const updatedDims = result.dimensions.map(d => 
      d.hitlStatus === 'pending' ? { ...d, hitlStatus: 'approved' as const } : d
    );
    onUpdate(project.id, { 
      result: { ...result, dimensions: updatedDims },
      status: 'completed',
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/library')} 
            className="border-[#2A3A4D] text-[#8A9BB0]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-[#8A9BB0] text-sm">{LAYER_LABELS[project.industryLayer]} · {STAGE_LABELS[project.stage]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {record.status === 'hitl_review' && (
            <Button onClick={handleApproveHITL} className="bg-green-600 hover:bg-green-700 gap-2">
              <ThumbsUp className="w-4 h-4" />
              HITL 审核通过
            </Button>
          )}
          <Button variant="outline" className="border-[#2A3A4D] text-[#8A9BB0] gap-2">
            <FileText className="w-4 h-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心评分区 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-2" style={{ backgroundColor: gradeConfig.bg, borderColor: gradeConfig.color }}>
          <CardContent className="p-6 text-center">
            <p className="text-[#8A9BB0] text-sm mb-2">ZETA-Score 总分</p>
            <p className="text-5xl font-bold" style={{ color: gradeConfig.color }}>{result.totalScore}</p>
            <Badge className="mt-2" style={{ backgroundColor: gradeConfig.color, color: '#111A25' }}>
              {gradeConfig.label}
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-6">
            <p className="text-[#8A9BB0] text-sm mb-3">基础分 (100)</p>
            <p className="text-3xl font-bold text-white">{result.baseScore}</p>
            <p className="text-xs text-[#8A9BB0] mt-1">5个核心维度加权</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-6">
            <p className="text-[#8A9BB0] text-sm mb-3">赋能附加分 (15)</p>
            <p className="text-3xl font-bold text-[#B8A9C9]">+{result.empowermentBonus}</p>
            <p className="text-xs text-[#8A9BB0] mt-1">研究院赋能匹配</p>
          </CardContent>
        </Card>
      </div>

      {/* 维度详细评分 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* 雷达图 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D] col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">维度得分雷达图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="#2A3A4D" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8A9BB0', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#C9A96E" fill="#C9A96E" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 子指标得分 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D] col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">子指标得分详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#8A9BB0', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8A9BB0', fontSize: 10 }} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A2535', border: '1px solid #2A3A4D', borderRadius: 8, color: '#fff' }}
                    formatter={(value: number) => [`${value}/5`, '得分']}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((_entry, index) => (
                      <Cell key={index} fill={['#C9A96E', '#7B6D8D', '#6C5B7B', '#B8A9C9', '#A394B4', '#8E7BA5'][index % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 维度评分卡 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {mainDimensions.map(dim => (
          <DimensionCard key={dim.dimensionId} dim={dim} weight={DIMENSIONS.find(d => d.id === dim.dimensionId)?.weight || 0} />
        ))}
        {d6Dimension && (
          <Card className="bg-[#1A2535] border-[#7B6D8D] col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <span className="text-[#B8A9C9]">D6</span>
                  {d6Dimension.dimensionName}
                  <Badge variant="outline" className="border-[#7B6D8D] text-[#B8A9C9] text-xs">附加分</Badge>
                </CardTitle>
                <span className="text-2xl font-bold text-[#B8A9C9]">+{d6Dimension.score}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#8A9BB0]">{d6Dimension.agentReasoning}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {d6Dimension.subScores.map(s => (
                  <Badge key={s.subId} variant="outline" className="border-[#7B6D8D]/50 text-[#8A9BB0] text-xs">
                    {s.subName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 风险点与建议 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              风险点 ({result.riskPoints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.riskPoints.length > 0 ? (
              <ul className="space-y-2">
                {result.riskPoints.map((risk, i) => (
                  <li key={i} className="text-sm text-yellow-400/90 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {risk}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-400">未发现明显风险点</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-[#C9A96E]" />
              AI Agent 投资建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white font-medium mb-2">{gradeConfig.action}</p>
            <p className="text-xs text-[#8A9BB0]">{result.recommendation}</p>
            <Separator className="bg-[#2A3A4D] my-3" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8A9BB0]">HITL状态：</span>
              {record.status === 'completed' ? (
                <Badge className="bg-green-600 text-white text-xs">审核已通过</Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">待人工审核</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DimensionCard({ dim, weight }: { dim: DimensionScore; weight: number }) {
  const adjustedWeight = weight;
  return (
    <Card className="bg-[#1A2535] border-[#2A3A4D]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="text-[#C9A96E]">{dim.dimensionId.toUpperCase()}</span>
            {dim.dimensionName}
            <span className="text-[10px] text-[#8A9BB0]">({adjustedWeight}%)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {dim.hitlStatus === 'approved' && <Badge className="bg-green-600 text-white text-xs">HITL通过</Badge>}
            {dim.hitlStatus === 'pending' && <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">待审核</Badge>}
            {dim.humanAdjustedScore && <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />}
            <span className="text-xl font-bold text-[#C9A96E]">{dim.humanAdjustedScore || dim.score}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-[#8A9BB0] mb-2">{dim.agentReasoning}</p>
        <div className="space-y-1">
          {dim.subScores.map(sub => (
            <div key={sub.subId} className="flex items-center justify-between text-xs">
              <span className="text-[#8A9BB0]">{sub.subName} ({sub.subWeight}%)</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7B6D8D] rounded-full" style={{ width: `${(sub.score / 5) * 100}%` }} />
                </div>
                <span className="text-white w-6 text-right">{sub.score}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
