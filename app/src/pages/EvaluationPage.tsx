import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { runZetaEvaluation } from '@/lib/zetaEngine';
import type { ProjectInfo, ZetaResult, AgentStep, AgentMessage } from '@/types/zeta';
import { Cpu, Users, TrendingUp, Factory, Briefcase, Handshake, BrainCircuit, GitMerge, CheckCircle, AlertTriangle } from 'lucide-react';

const AGENT_ICONS: Record<string, React.ElementType> = {
  Cpu, Users, TrendingUp, Factory, Briefcase, Handshake, BrainCircuit, GitMerge,
};

const AGENT_COLORS: Record<string, string> = {
  tech_agent: '#C9A96E', team_agent: '#7B6D8D', market_agent: '#6C5B7B',
  industry_agent: '#B8A9C9', business_agent: '#A394B4', empowerment_agent: '#8E7BA5',
  coordinator: '#C9A96E', synthesizer: '#C9A96E',
};

interface Props {
  project?: ProjectInfo;
  onComplete: (result: ZetaResult) => void;
}

export function EvaluationPage({ project, onComplete }: Props) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<ZetaResult | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [, setIsRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;
    setIsRunning(true);
    runZetaEvaluation(project, (step) => {
      setSteps(prev => {
        const existing = prev.findIndex(s => s.agentId === step.agentId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = step;
          return updated;
        }
        return [...prev, step];
      });
    }).then(res => {
      setResult(res);
      setOverallProgress(100);
      setIsRunning(false);
      onComplete(res);
    });
  }, [project]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  useEffect(() => {
    if (steps.length > 0) {
      const completed = steps.filter(s => s.status === 'completed').length;
      setOverallProgress(Math.round((completed / 8) * 100));
    }
  }, [steps]);

  if (!project) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Card className="bg-[#1A2535] border-[#2A3A4D] p-8 text-center">
          <p className="text-[#8A9BB0]">项目信息不存在</p>
          <Button onClick={() => navigate('/new')} className="mt-4 bg-[#C9A96E] text-[#111A25]">
            创建新项目
          </Button>
        </Card>
      </div>
    );
  }

  const getMessageIcon = (msg: AgentMessage) => {
    switch (msg.type) {
      case 'thinking': return <BrainCircuit className="w-3.5 h-3.5 text-[#8A9BB0]" />;
      case 'action': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
      case 'result': return <CheckCircle className="w-3.5 h-3.5 text-[#C9A96E]" />;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">AI Agent 协同评价中</h2>
        <p className="text-[#8A9BB0] mt-1">项目：{project.name}</p>
      </div>

      {/* 总体进度 */}
      <Card className="bg-[#1A2535] border-[#2A3A4D] mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#8A9BB0]">评价进度</span>
            <span className="text-sm font-bold text-[#C9A96E]">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-[#0D1117]" />
          <div className="flex justify-between mt-2 text-xs text-[#8A9BB0]">
            <span>Coordinator</span>
            <span>6 Specialist Agents</span>
            <span>Synthesizer</span>
          </div>
        </CardContent>
      </Card>

      {/* Agent状态 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {steps.filter(s => s.agentId !== 'coordinator' && s.agentId !== 'synthesizer').map(step => {
          const Icon = AGENT_ICONS[step.agentIcon] || Cpu;
          const color = AGENT_COLORS[step.agentId] || '#8A9BB0';
          return (
            <Card key={step.agentId} className="bg-[#1A2535] border-[#2A3A4D]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{step.agentName}</p>
                    <p className="text-[10px] text-[#8A9BB0]">
                      {step.status === 'completed' ? '已完成' : step.status === 'running' ? '执行中...' : '待启动'}
                    </p>
                  </div>
                  {step.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                  {step.status === 'running' && (
                    <div className="w-4 h-4 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                </div>
                {step.status === 'running' && (
                  <Progress value={step.progress} className="h-1 mt-2 bg-[#0D1117]" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 实时日志 */}
      <Card className="bg-[#1A2535] border-[#2A3A4D] flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="p-4 border-b border-[#2A3A4D] flex items-center justify-between">
            <h3 className="text-sm font-medium">Agent 实时日志</h3>
            <span className="text-xs text-[#8A9BB0]">{steps.reduce((c, s) => c + s.messages.length, 0)} 条消息</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {steps.flatMap(s => s.messages.map((msg, i) => ({ ...msg, agentName: s.agentName, agentId: s.agentId, key: `${s.agentId}-${i}` })))
              .map(msg => {
                const color = AGENT_COLORS[msg.agentId] || '#8A9BB0';
                return (
                  <div key={msg.key} className="flex items-start gap-2.5 text-sm">
                    {getMessageIcon(msg)}
                    <span className="text-[10px] text-[#8A9BB0] shrink-0 mt-0.5" style={{ color }}>
                      {msg.agentName}
                    </span>
                    <span className={`${msg.type === 'warning' ? 'text-yellow-400' : msg.type === 'result' ? 'text-[#C9A96E]' : 'text-[#CBD5E0]'}`}>
                      {msg.content}
                    </span>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* 结果按钮 */}
      {result && (
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => navigate(`/result/${project.id}`)}
            className="bg-[#C9A96E] hover:bg-[#B8995E] text-[#111A25] font-bold gap-2 px-8 py-5 text-lg"
          >
            <CheckCircle className="w-5 h-5" />
            查看评价结果 (ZETA-Score: {result.totalScore})
          </Button>
        </div>
      )}
    </div>
  );
}
