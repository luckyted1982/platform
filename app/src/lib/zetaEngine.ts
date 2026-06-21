/**
 * ZETA-Score AI Agent 评价引擎
 * 使用DeepSeek真实大模型API进行多Agent协作评分
 */

import type {
  ProjectInfo,
  ZetaResult,
  DimensionScore,
  AgentStep,
  Grade,
} from '@/types/zeta';
import {
  evaluateTechAgent,
  evaluateTeamAgent,
  evaluateMarketAgent,
  evaluateIndustryAgent,
  evaluateBusinessAgent,
  evaluateEmpowermentAgent,
} from './deepseek';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function createMsg(type: AgentStep['messages'][0]['type'], content: string) {
  return { type, content, timestamp: Date.now() };
}

function calcGrade(total: number): Grade {
  if (total >= 90) return 'S';
  if (total >= 75) return 'A';
  if (total >= 60) return 'B';
  if (total >= 45) return 'C';
  return 'D';
}

function getWeights(layer: ProjectInfo['industryLayer']) {
  const base = { d1: 30, d2: 25, d3: 20, d4: 15, d5: 10 };
  if (layer === 'base') return { ...base, d1: 35, d3: 15 };
  if (layer === 'application') return { ...base, d1: 25, d3: 25 };
  return base;
}

// 综合Synthesizer Agent：汇总所有维度评分，生成最终报告
async function synthesizeResult(
  project: ProjectInfo,
  dimensions: DimensionScore[],
  agentSteps: AgentStep[],
  onUpdate: (step: AgentStep) => void
): Promise<ZetaResult> {
  const synthStep: AgentStep = {
    agentId: 'synthesizer',
    agentName: 'Synthesizer',
    agentIcon: 'GitMerge',
    status: 'running',
    progress: 0,
    messages: [createMsg('thinking', 'Synthesizer Agent启动，汇总6维度评分结果...')],
  };
  onUpdate(synthStep);

  const weights = getWeights(project.industryLayer);
  
  // 计算基础分
  let baseScore = 0;
  dimensions.forEach(d => {
    if (d.dimensionId !== 'd6') {
      const w = weights[d.dimensionId as keyof typeof weights] || 0;
      baseScore += d.score * (w / 100) * 20;
    }
  });

  const d6Dim = dimensions.find(d => d.dimensionId === 'd6');
  const empowermentBonus = d6Dim?.score || 0;
  const totalScore = Math.round((baseScore + empowermentBonus) * 10) / 10;

  // 风险点识别
  const risks: string[] = [];
  const d1 = dimensions.find(d => d.dimensionId === 'd1');
  const d2 = dimensions.find(d => d.dimensionId === 'd2');
  const d3 = dimensions.find(d => d.dimensionId === 'd3');
  
  if (d1 && Math.abs(project.trlLevel - project.mrlLevel) > 2) {
    risks.push(`TRL-MRL剪刀差${Math.abs(project.trlLevel - project.mrlLevel)}级，量产风险较高`);
  }
  if (project.patents === 0) {
    risks.push('无核心专利布局，知识产权保护薄弱');
  }
  if (!project.hasCustomers && project.stage !== 'angel') {
    risks.push('非天使轮项目尚无付费客户，商业化验证不足');
  }
  if (project.teamSize < 3) {
    risks.push('核心团队不足3人，关键岗位可能空缺');
  }
  if (d2 && d2.score < 3) {
    risks.push('团队评分较低，需关注创始人匹配度和团队完整性');
  }
  if (d3 && project.tam < 100) {
    risks.push('目标市场规模（TAM）不足100亿元，市场空间有限');
  }

  await delay(500);
  synthStep.progress = 50;
  synthStep.messages.push(createMsg('action', `基础分计算完成: ${Math.round(baseScore * 10) / 10}分`));
  synthStep.messages.push(createMsg('action', `赋能附加分: +${empowermentBonus}分`));
  synthStep.messages.push(createMsg('action', `总分: ${totalScore}分，等级: ${calcGrade(totalScore)}`));
  onUpdate(synthStep);
  await delay(400);

  if (risks.length > 0) {
    synthStep.messages.push(createMsg('warning', `识别${risks.length}个风险点`));
    onUpdate(synthStep);
  }

  await delay(300);
  synthStep.progress = 100;
  synthStep.status = 'completed';
  synthStep.messages.push(createMsg('result', 'ZETA-Score综合评分计算完成'));
  onUpdate(synthStep);
  agentSteps.push(synthStep);

  const grade = calcGrade(totalScore);
  const recMap: Record<string, string> = {
    S: '优先投资标的，立即启动尽调流程',
    A: '优质标的，建议重点跟进深入调研',
    B: '条件性跟进，需验证关键假设后决策',
    C: '观察类标的，暂不投入资源',
    D: '不建议投资，技术方向或团队存在重大风险',
  };

  return {
    projectId: project.id,
    baseScore: Math.round(baseScore * 10) / 10,
    empowermentBonus,
    totalScore,
    grade,
    dimensions,
    agentSteps,
    riskPoints: risks,
    recommendation: recMap[grade],
    createdAt: new Date(),
    completedAt: new Date(),
  };
}

// ======== 主引擎入口 ========

export async function runZetaEvaluation(
  project: ProjectInfo,
  onStepUpdate: (step: AgentStep) => void
): Promise<ZetaResult> {
  // Coordinator Agent 启动
  const coordStep: AgentStep = {
    agentId: 'coordinator',
    agentName: 'Coordinator',
    agentIcon: 'BrainCircuit',
    status: 'running',
    progress: 0,
    messages: [createMsg('thinking', `Coordinator Agent启动 — 项目「${project.name}」开始ZETA-Score评价`)],
  };
  onStepUpdate(coordStep);
  await delay(300);

  coordStep.messages.push(createMsg('action', `项目信息摘要: ${project.name} | ${project.industryLayer} | ${project.stage} | 团队${project.teamSize}人 | TRL-${project.trlLevel} | MRL-${project.mrlLevel}`));
  coordStep.progress = 30;
  onStepUpdate(coordStep);
  await delay(300);

  coordStep.messages.push(createMsg('action', '分解评价任务为6个专业子任务，分发给Specialist Agents'));
  coordStep.progress = 100;
  coordStep.status = 'completed';
  onStepUpdate(coordStep);

  const dimensions: DimensionScore[] = [];
  const agentSteps: AgentStep[] = [coordStep];

  // 依次运行6个专业Agent（使用DeepSeek真实API）
  const techStep: AgentStep = {
    agentId: 'tech_agent', agentName: 'TechAgent', agentIcon: 'Cpu',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'TechAgent等待启动...')],
    dimensionId: 'd1',
  };
  onStepUpdate(techStep);
  const d1 = await evaluateTechAgent(project, techStep, onStepUpdate);
  dimensions.push(d1);
  agentSteps.push(techStep);
  await delay(200);

  const teamStep: AgentStep = {
    agentId: 'team_agent', agentName: 'TeamAgent', agentIcon: 'Users',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'TeamAgent等待启动...')],
    dimensionId: 'd2',
  };
  onStepUpdate(teamStep);
  const d2 = await evaluateTeamAgent(project, teamStep, onStepUpdate);
  dimensions.push(d2);
  agentSteps.push(teamStep);
  await delay(200);

  const marketStep: AgentStep = {
    agentId: 'market_agent', agentName: 'MarketAgent', agentIcon: 'TrendingUp',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'MarketAgent等待启动...')],
    dimensionId: 'd3',
  };
  onStepUpdate(marketStep);
  const d3 = await evaluateMarketAgent(project, marketStep, onStepUpdate);
  dimensions.push(d3);
  agentSteps.push(marketStep);
  await delay(200);

  const indStep: AgentStep = {
    agentId: 'industry_agent', agentName: 'IndustryAgent', agentIcon: 'Factory',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'IndustryAgent等待启动...')],
    dimensionId: 'd4',
  };
  onStepUpdate(indStep);
  const d4 = await evaluateIndustryAgent(project, indStep, onStepUpdate);
  dimensions.push(d4);
  agentSteps.push(indStep);
  await delay(200);

  const bizStep: AgentStep = {
    agentId: 'business_agent', agentName: 'BusinessAgent', agentIcon: 'Briefcase',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'BusinessAgent等待启动...')],
    dimensionId: 'd5',
  };
  onStepUpdate(bizStep);
  const d5 = await evaluateBusinessAgent(project, bizStep, onStepUpdate);
  dimensions.push(d5);
  agentSteps.push(bizStep);
  await delay(200);

  const empStep: AgentStep = {
    agentId: 'empowerment_agent', agentName: 'EmpowermentAgent', agentIcon: 'Handshake',
    status: 'idle', progress: 0, messages: [createMsg('thinking', 'EmpowermentAgent等待启动...')],
    dimensionId: 'd6',
  };
  onStepUpdate(empStep);
  const d6 = await evaluateEmpowermentAgent(project, empStep, onStepUpdate);
  dimensions.push(d6);
  agentSteps.push(empStep);
  await delay(200);

  // Synthesizer Agent汇总
  return synthesizeResult(project, dimensions, agentSteps, onStepUpdate);
}

// 生成模拟数据
export function generateMockProject(): ProjectInfo {
  return {
    id: `proj_${Date.now()}`,
    name: '光联芯科（OIO光互连芯片）',
    description: '基于光学I/O（OIO）技术的高性能芯片间光互连解决方案，突破传统电互连带宽瓶颈，为AI算力集群提供超高带宽、低功耗的互连方案。',
    industryLayer: 'platform',
    stage: 'a',
    teamSize: 8,
    founderBackground: '清华大学电子工程系博士，曾任Intel高级架构师，在硅光芯片领域有15年研究经验，主导过3个国家级重点项目。核心团队来自清华、中科院、华为海思，平均从业经验10年+。',
    coreTech: '自研硅光调制器与探测器集成技术，首创OIO chiplet架构，实现单通道400Gbps传输速率，功耗较传统电互连降低60%。技术路线与Intel、NVIDIA的CPO方向一致，但采用更激进的集成方案。',
    patents: 12,
    trlLevel: 6,
    mrlLevel: 4,
    tam: 1500,
    sam: 300,
    som: 50,
    hasCustomers: true,
    arr: 800,
    competitors: 'Intel硅光部门、NVIDIA CPO团队、Ayar Labs、Lightmatter',
    differentiator: '相比Ayar Labs的美国方案，本项目采用国产化供应链，成本降低40%；相比Intel方案，集成度更高，单芯片可支持128通道。',
    fundDirection: ['硅光/CPO', 'AI硬件'],
    empowermentAreas: ['AI For Patent', '创新中心（联合实验室/算力中心）'],
    createdAt: new Date(),
  };
}
