import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GRADE_CONFIG, STAGE_LABELS, LAYER_LABELS } from '@/types/zeta';
import type { ProjectRecord } from '@/types/zeta';
import { Search, Filter, ArrowRight } from 'lucide-react';

interface Props {
  projects: ProjectRecord[];
}

export function ProjectLibrary({ projects }: Props) {
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterLayer, setFilterLayer] = useState<string>('all');

  const filtered = projects.filter(p => {
    if (search && !p.project.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGrade !== 'all' && (!p.result || p.result.grade !== filterGrade)) return false;
    if (filterLayer !== 'all' && p.project.industryLayer !== filterLayer) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">项目库</h2>
          <p className="text-[#8A9BB0] mt-1">共 {projects.length} 个项目，其中 {projects.filter(p => p.result).length} 个已完成评价</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9BB0]" />
          <Input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索项目名称..." 
            className="pl-9 bg-[#1A2535] border-[#2A3A4D]" 
          />
        </div>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-40 bg-[#1A2535] border-[#2A3A4D]">
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue placeholder="评级筛选" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2535] border-[#2A3A4D]">
            <SelectItem value="all">全部评级</SelectItem>
            {Object.entries(GRADE_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterLayer} onValueChange={setFilterLayer}>
          <SelectTrigger className="w-48 bg-[#1A2535] border-[#2A3A4D]">
            <SelectValue placeholder="层级筛选" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A2535] border-[#2A3A4D]">
            <SelectItem value="all">全部层级</SelectItem>
            {Object.entries(LAYER_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 项目列表 */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(p => (
            <ProjectRow key={p.project.id} record={p} />
          ))}
        </div>
      ) : (
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardContent className="p-12 text-center">
            <p className="text-[#8A9BB0]">暂无匹配的项目</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectRow({ record }: { record: ProjectRecord }) {
  const { project, result, status } = record;
  const gradeColor = result ? GRADE_CONFIG[result.grade].color : '#8A9BB0';

  return (
    <Card className="bg-[#1A2535] border-[#2A3A4D] hover:border-[#7B6D8D]/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* 评分/状态 */}
          <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center shrink-0" 
            style={{ backgroundColor: result ? `${gradeColor}15` : '#2A3A4D' }}>
            {result ? (
              <>
                <span className="text-lg font-bold" style={{ color: gradeColor }}>{result.grade}</span>
                <span className="text-[10px] text-[#8A9BB0]">{result.totalScore}分</span>
              </>
            ) : (
              <span className="text-xs text-[#8A9BB0]">评价中</span>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-medium truncate">{project.name}</h3>
              <Badge variant="outline" className="border-[#2A3A4D] text-[#8A9BB0] text-xs shrink-0">
                {STAGE_LABELS[project.stage]}
              </Badge>
              <Badge variant="outline" className="border-[#2A3A4D] text-[#8A9BB0] text-xs shrink-0">
                {LAYER_LABELS[project.industryLayer]}
              </Badge>
            </div>
            <p className="text-xs text-[#8A9BB0] truncate">{project.description}</p>
            {result && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex gap-1">
                  {result.dimensions.slice(0, 5).map(d => (
                    <div key={d.dimensionId} className="flex flex-col items-center">
                      <span className="text-[9px] text-[#8A9BB0]">{d.dimensionId.toUpperCase()}</span>
                      <div className="w-6 h-1 bg-[#0D1117] rounded-full overflow-hidden mt-0.5">
                        <div className="h-full bg-[#7B6D8D] rounded-full" style={{ width: `${(d.score / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-[#8A9BB0]">
                  {status === 'completed' ? 'HITL已通过' : status === 'hitl_review' ? '待HITL审核' : '评价中'}
                </span>
              </div>
            )}
          </div>

          {/* 操作 */}
          <Link to={result ? `/result/${project.id}` : `/evaluate/${project.id}`} 
            className="shrink-0 p-2 rounded-lg hover:bg-[#2A3A4D] transition-colors">
            <ArrowRight className="w-5 h-5 text-[#8A9BB0]" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
