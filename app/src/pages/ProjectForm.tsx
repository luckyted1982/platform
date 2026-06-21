import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { generateMockProject } from '@/lib/zetaEngine';
import type { ProjectInfo, ProjectRecord } from '@/types/zeta';
import { STAGE_LABELS, LAYER_LABELS, FUND_DIRECTIONS, EMPOWERMENT_AREAS } from '@/types/zeta';
import { FileUp, Sparkles } from 'lucide-react';

interface Props {
  onSubmit: (record: ProjectRecord) => void;
  onStartEval: (id: string) => void;
}

export function ProjectForm({ onSubmit, onStartEval }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<ProjectInfo>>({
    industryLayer: 'platform',
    stage: 'angel',
    teamSize: 3,
    trlLevel: 4,
    mrlLevel: 3,
    tam: 100,
    sam: 20,
    som: 5,
    patents: 0,
    arr: 0,
    hasCustomers: false,
    fundDirection: [],
    empowermentAreas: [],
  });

  const update = useCallback(<K extends keyof ProjectInfo>(key: K, value: ProjectInfo[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = (key: 'fundDirection' | 'empowermentAreas', value: string) => {
    setForm(prev => {
      const arr = (prev[key] || []) as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.founderBackground || !form.coreTech) {
      toast.error('请填写所有必填项');
      return;
    }
    const project: ProjectInfo = {
      ...form,
      id: `proj_${Date.now()}`,
      createdAt: new Date(),
    } as ProjectInfo;

    const record: ProjectRecord = { project, result: null, status: 'draft' };
    onSubmit(record);
    onStartEval(project.id);
    toast.success('项目信息已保存，开始AI Agent评价');
    navigate(`/evaluate/${project.id}`);
  };

  const fillMock = () => {
    const mock = generateMockProject();
    setForm({ ...mock, id: undefined, createdAt: undefined });
    toast.info('已填充示例数据');
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">新建项目评价</h2>
          <p className="text-[#8A9BB0] mt-1">填写项目信息，6个AI Agent将协同完成ZETA-Score评价</p>
        </div>
        <Button variant="outline" onClick={fillMock} className="border-[#2A3A4D] text-[#8A9BB0] hover:text-white hover:bg-[#1A2535] gap-2">
          <Sparkles className="w-4 h-4" />
          填充示例数据
        </Button>
      </div>

      <div className="space-y-6">
        {/* 基础信息 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-xs flex items-center justify-center">1</span>
              基础信息
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-[#8A9BB0]">项目名称 <span className="text-red-400">*</span></Label>
              <Input value={form.name || ''} onChange={e => update('name', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" placeholder="输入项目名称" />
            </div>
            <div className="col-span-2">
              <Label className="text-[#8A9BB0]">项目简介 <span className="text-red-400">*</span></Label>
              <Textarea value={form.description || ''} onChange={e => update('description', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" rows={3} placeholder="简要描述项目核心业务和技术" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">产业链层级</Label>
              <Select value={form.industryLayer} onValueChange={v => update('industryLayer', v as ProjectInfo['industryLayer'])}>
                <SelectTrigger className="bg-[#0D1117] border-[#2A3A4D] mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1A2535] border-[#2A3A4D]">
                  {Object.entries(LAYER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#8A9BB0]">融资阶段</Label>
              <Select value={form.stage} onValueChange={v => update('stage', v as ProjectInfo['stage'])}>
                <SelectTrigger className="bg-[#0D1117] border-[#2A3A4D] mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1A2535] border-[#2A3A4D]">
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 技术与团队 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-xs flex items-center justify-center">2</span>
              技术与团队
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-[#8A9BB0]">创始人/核心团队背景 <span className="text-red-400">*</span></Label>
              <Textarea value={form.founderBackground || ''} onChange={e => update('founderBackground', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" rows={3} placeholder="创始人学历、工作经历、成功退出经历等" />
            </div>
            <div className="col-span-2">
              <Label className="text-[#8A9BB0]">核心技术描述 <span className="text-red-400">*</span></Label>
              <Textarea value={form.coreTech || ''} onChange={e => update('coreTech', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" rows={3} placeholder="核心技术原理、差异化优势、技术路线等" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">核心团队人数: {form.teamSize}</Label>
              <Slider value={[form.teamSize || 1]} onValueChange={v => update('teamSize', v[0])} 
                min={1} max={50} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">核心专利数量: {form.patents}</Label>
              <Slider value={[form.patents || 0]} onValueChange={v => update('patents', v[0])} 
                min={0} max={100} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">TRL技术成熟度: {form.trlLevel}</Label>
              <Slider value={[form.trlLevel || 1]} onValueChange={v => update('trlLevel', v[0])} 
                min={1} max={9} step={1} className="mt-2" />
              <p className="text-[11px] text-[#8A9BB0] mt-1">1=基础研究 → 9=完全成熟</p>
            </div>
            <div>
              <Label className="text-[#8A9BB0]">MRL制造就绪度: {form.mrlLevel}</Label>
              <Slider value={[form.mrlLevel || 1]} onValueChange={v => update('mrlLevel', v[0])} 
                min={1} max={10} step={1} className="mt-2" />
              <p className="text-[11px] text-[#8A9BB0] mt-1">1=制造概念 → 10=满产运行</p>
            </div>
          </CardContent>
        </Card>

        {/* 市场与竞争 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-xs flex items-center justify-center">3</span>
              市场与竞争
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-[#8A9BB0]">TAM潜在市场 (亿元)</Label>
              <Input type="number" value={form.tam || ''} onChange={e => update('tam', Number(e.target.value))} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">SAM可服务市场 (亿元)</Label>
              <Input type="number" value={form.sam || ''} onChange={e => update('sam', Number(e.target.value))} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">SOM可获得市场 (亿元)</Label>
              <Input type="number" value={form.som || ''} onChange={e => update('som', Number(e.target.value))} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-[#8A9BB0]">差异化竞争策略</Label>
              <Textarea value={form.differentiator || ''} onChange={e => update('differentiator', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" rows={2} placeholder="与竞争对手的核心差异" />
            </div>
            <div>
              <Label className="text-[#8A9BB0]">竞争对手</Label>
              <Textarea value={form.competitors || ''} onChange={e => update('competitors', e.target.value)} 
                className="bg-[#0D1117] border-[#2A3A4D] mt-1" rows={2} placeholder="主要竞争对手" />
            </div>
            <div className="col-span-3 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox checked={form.hasCustomers} onCheckedChange={v => update('hasCustomers', !!v)} />
                <Label className="text-[#8A9BB0] cursor-pointer">已有付费客户</Label>
              </div>
              {form.hasCustomers && (
                <div className="flex-1">
                  <Label className="text-[#8A9BB0]">ARR年收入 (万元): {form.arr}</Label>
                  <Slider value={[form.arr || 0]} onValueChange={v => update('arr', v[0])} 
                    min={0} max={10000} step={10} className="mt-1" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 投资方向与赋能匹配 */}
        <Card className="bg-[#1A2535] border-[#2A3A4D]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-xs flex items-center justify-center">4</span>
              投资方向与赋能匹配
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#8A9BB0] mb-2 block">基金投资方向（可多选）</Label>
              <div className="flex flex-wrap gap-2">
                {FUND_DIRECTIONS.map(dir => (
                  <button key={dir} onClick={() => toggleArray('fundDirection', dir)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      form.fundDirection?.includes(dir) 
                        ? 'bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E]' 
                        : 'bg-[#0D1117] border-[#2A3A4D] text-[#8A9BB0] hover:border-[#7B6D8D]'
                    }`}>
                    {dir}
                  </button>
                ))}
              </div>
            </div>
            <Separator className="bg-[#2A3A4D]" />
            <div>
              <Label className="text-[#8A9BB0] mb-2 block">研究院赋能板块匹配（可多选）</Label>
              <div className="flex flex-wrap gap-2">
                {EMPOWERMENT_AREAS.map(area => (
                  <button key={area} onClick={() => toggleArray('empowermentAreas', area)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      form.empowermentAreas?.includes(area) 
                        ? 'bg-[#7B6D8D]/20 border-[#7B6D8D] text-[#B8A9C9]' 
                        : 'bg-[#0D1117] border-[#2A3A4D] text-[#8A9BB0] hover:border-[#7B6D8D]'
                    }`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/')} 
            className="border-[#2A3A4D] text-[#8A9BB0] hover:text-white hover:bg-[#1A2535]">
            取消
          </Button>
          <Button onClick={handleSubmit} className="bg-[#C9A96E] hover:bg-[#B8995E] text-[#111A25] font-bold gap-2 px-6">
            <FileUp className="w-4 h-4" />
            启动 AI Agent 评价
          </Button>
        </div>
      </div>
    </div>
  );
}
