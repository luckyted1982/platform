/**
 * DeepSeek API 服务模块
 * 用于驱动ZETA-Score AI Agent评价引擎
 */

import type { ProjectInfo, DimensionScore, SubScore, AgentStep } from '@/types/zeta';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

// 调用DeepSeek API
async function callDeepSeek(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data: ChatCompletionResponse = await response.json();
    
    if (data.error) {
      throw new Error(`API错误: ${data.error.message}`);
    }

    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    throw error;
  }
}

// 通用评价Agent调用
async function runDimensionAgent(
  project: ProjectInfo,
  dimensionId: string,
  dimensionName: string,
  systemPrompt: string,
  userPrompt: string,
  subScoreConfig: { subId: string; subName: string; subWeight: number }[],
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  step.messages.push({
    type: 'thinking',
    content: `正在调用DeepSeek大模型进行${dimensionName}评价...`,
    timestamp: Date.now(),
  });
  step.status = 'running';
  step.progress = 30;
  onUpdate({ ...step });

  try {
    const response = await callDeepSeek(messages);
    
    step.messages.push({
      type: 'action',
      content: 'DeepSeek API返回评价结果，正在解析...',
      timestamp: Date.now(),
    });
    step.progress = 70;
    onUpdate({ ...step });

    // 解析JSON响应
    let result: { subScores: SubScore[]; reasoning: string; dimensionScore: number };
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析JSON响应');
      }
    } catch {
      // 如果解析失败，使用备用方案：从文本中提取评分
      result = parseTextResponse(response, subScoreConfig);
    }

    step.messages.push({
      type: 'result',
      content: `${dimensionName}评价完成，评分: ${result.dimensionScore}/5`,
      timestamp: Date.now(),
    });
    step.progress = 100;
    step.status = 'completed';
    onUpdate({ ...step });

    // 计算权重
    const weightMap: Record<string, number> = {
      d1: 30, d2: 25, d3: 20, d4: 15, d5: 10, d6: 0,
    };

    return {
      dimensionId,
      dimensionName,
      dimensionNameEn: dimensionId === 'd1' ? 'Technology Assets' :
        dimensionId === 'd2' ? 'Team Execution' :
        dimensionId === 'd3' ? 'Market Readiness' :
        dimensionId === 'd4' ? 'Industry Fit' :
        dimensionId === 'd5' ? 'Business Maturity' : 'Empowerment Fit',
      weight: weightMap[dimensionId] || 0,
      score: Math.min(5, Math.max(1, Math.round(result.dimensionScore * 10) / 10)),
      subScores: result.subScores,
      agentReasoning: result.reasoning || `${dimensionName}评价基于DeepSeek大模型分析`,
      hitlStatus: 'pending',
    };
  } catch (error) {
    step.messages.push({
      type: 'warning',
      content: `API调用失败，使用本地规则引擎降级评分: ${(error as Error).message}`,
      timestamp: Date.now(),
    });
    step.status = 'completed';
    step.progress = 100;
    onUpdate({ ...step });

    // 降级到本地规则评分
    return fallbackDimensionScore(dimensionId, dimensionName, project, subScoreConfig);
  }
}

// 从文本响应中解析评分
function parseTextResponse(
  text: string,
  config: { subId: string; subName: string; subWeight: number }[]
): { subScores: SubScore[]; reasoning: string; dimensionScore: number } {
  const subScores: SubScore[] = config.map(({ subId, subName, subWeight }) => {
    // 尝试从文本中匹配评分
    const scoreMatch = text.match(new RegExp(`${subName}[:：]\\s*(\\d+(?:\\.\\d+)?)\\s*/\\s*5`));
    const score = scoreMatch ? Math.min(5, Math.max(1, parseFloat(scoreMatch[1]))) : 3;
    return {
      subId,
      subName,
      subWeight,
      score,
      evidence: `${subName}评分${score}分`,
    };
  });

  const avgScore = subScores.reduce((s, sub) => s + sub.score * (sub.subWeight / 100), 0);
  return {
    subScores,
    reasoning: text.slice(0, 500),
    dimensionScore: Math.round(avgScore * 10) / 10,
  };
}

// 降级评分（当API失败时使用）
function fallbackDimensionScore(
  dimensionId: string,
  dimensionName: string,
  project: ProjectInfo,
  config: { subId: string; subName: string; subWeight: number }[]
): DimensionScore {
  let subScores: SubScore[] = [];
  let reasoning = '本地规则引擎评分（API降级模式）';

  switch (dimensionId) {
    case 'd1': {
      const hasUniqueTech = project.coreTech.length > 20 && 
        (project.coreTech.includes('自研') || project.coreTech.includes('首创') || project.coreTech.includes('国产'));
      const diffScore = hasUniqueTech ? 4.5 : project.patents > 5 ? 4 : project.patents > 0 ? 3 : 2;
      const trlScore = project.trlLevel >= 7 ? 5 : project.trlLevel >= 4 ? 3 + (project.trlLevel - 4) * 0.5 : project.trlLevel >= 2 ? 2 : 1;
      const mrlScore = project.mrlLevel >= 8 ? 5 : project.mrlLevel >= 5 ? 3 + (project.mrlLevel - 5) * 0.5 : project.mrlLevel >= 3 ? 2 : 1;
      const ipScore = project.patents >= 20 ? 5 : project.patents >= 10 ? 4 : project.patents >= 5 ? 3.5 : project.patents > 0 ? 2.5 : 1;
      const scissorsGap = Math.abs(project.trlLevel - project.mrlLevel);
      subScores = [
        { subId: 's1.1', subName: '技术差异化程度', subWeight: 35, score: diffScore, evidence: hasUniqueTech ? '具备核心技术差异化' : '技术差异化一般' },
        { subId: 's1.2', subName: '技术成熟度TRL', subWeight: 25, score: trlScore, evidence: `TRL-${project.trlLevel}` },
        { subId: 's1.3', subName: '制造就绪度MRL', subWeight: 20, score: mrlScore, evidence: `MRL-${project.mrlLevel}${scissorsGap > 2 ? '，与TRL存在剪刀差' : ''}` },
        { subId: 's1.4', subName: '知识产权布局', subWeight: 20, score: ipScore, evidence: `${project.patents}项专利` },
      ];
      reasoning = `技术差异化${diffScore}分，TRL-${project.trlLevel}对应${trlScore}分，MRL-${project.mrlLevel}对应${mrlScore}分，专利${project.patents}项对应${ipScore}分。${scissorsGap > 2 ? '关键风险：TRL-MRL剪刀差超2级。' : ''}`;
      break;
    }
    case 'd2': {
      const founderExp = project.founderBackground.length;
      const hasExit = project.founderBackground.includes('退出') || project.founderBackground.includes('上市');
      const founderScore = hasExit ? 5 : founderExp > 50 ? 4.5 : founderExp > 30 ? 4 : founderExp > 15 ? 3 : 2;
      const teamScore = project.teamSize >= 5 ? 4.5 : project.teamSize >= 3 ? 4 : project.teamSize >= 2 ? 3 : 2;
      const cognitionScore = founderExp > 30 ? 4 : founderExp > 15 ? 3.5 : 2.5;
      subScores = [
        { subId: 's2.1', subName: '创始人-市场匹配度', subWeight: 40, score: founderScore, evidence: hasExit ? '有成功退出经历' : '行业经验丰富' },
        { subId: 's2.2', subName: '团队完整性与凝聚力', subWeight: 30, score: teamScore, evidence: `${project.teamSize}人核心团队` },
        { subId: 's2.3', subName: '心力、认知与战略能力', subWeight: 30, score: cognitionScore, evidence: cognitionScore >= 4 ? '战略清晰' : '战略能力待验证' },
      ];
      reasoning = `创始人${founderScore}分，团队完整性${teamScore}分，认知与战略${cognitionScore}分。`;
      break;
    }
    case 'd3': {
      const tamScore = project.tam > 1000 ? 5 : project.tam > 500 ? 4.5 : project.tam > 100 ? 4 : project.tam > 50 ? 3 : 2;
      const compScore = project.differentiator.length > 20 ? 4 : 3;
      const tractionScore = project.hasCustomers ? (project.arr > 1000 ? 5 : project.arr > 100 ? 4 : 3.5) : 2.5;
      subScores = [
        { subId: 's3.1', subName: '目标市场规模TAM', subWeight: 35, score: tamScore, evidence: `TAM ${project.tam}亿元` },
        { subId: 's3.2', subName: '竞争格局与差异化', subWeight: 30, score: compScore, evidence: project.differentiator },
        { subId: 's3.3', subName: '客户验证与traction', subWeight: 35, score: tractionScore, evidence: project.hasCustomers ? `ARR ${project.arr}万元` : '无客户验证' },
      ];
      reasoning = `市场规模${tamScore}分，竞争格局${compScore}分，客户验证${tractionScore}分。`;
      break;
    }
    case 'd4': {
      const fundMatchScore = project.fundDirection.length >= 2 ? 5 : project.fundDirection.length === 1 ? 4 : 2.5;
      const isCardNeck = project.coreTech.includes('卡脖子') || project.coreTech.includes('国产') || project.coreTech.includes('替代');
      const replacementScore = isCardNeck ? 5 : 3.5;
      subScores = [
        { subId: 's4.1', subName: '基金投资方向匹配度', subWeight: 40, score: fundMatchScore, evidence: `命中${project.fundDirection.length}个方向` },
        { subId: 's4.2', subName: '国产替代紧迫度', subWeight: 35, score: replacementScore, evidence: isCardNeck ? '卡脖子领域' : '有替代空间' },
        { subId: 's4.3', subName: '产业链位置与价值捕获', subWeight: 25, score: 4, evidence: '产业链高价值环节' },
      ];
      reasoning = `基金方向匹配${fundMatchScore}分，国产替代紧迫度${replacementScore}分。`;
      break;
    }
    case 'd5': {
      const modelScore = project.hasCustomers ? 4 : project.differentiator.length > 15 ? 3 : 2;
      const financialScore = project.stage !== 'angel' ? 4 : 3;
      const scaleScore = project.hasCustomers ? 4 : 2.5;
      subScores = [
        { subId: 's5.1', subName: '商业模式清晰度', subWeight: 40, score: modelScore, evidence: modelScore >= 4 ? '模式清晰' : '待完善' },
        { subId: 's5.2', subName: '财务纪律与成本结构', subWeight: 30, score: financialScore, evidence: `${project.stage}阶段` },
        { subId: 's5.3', subName: '规模化路径可行性', subWeight: 30, score: scaleScore, evidence: scaleScore >= 4 ? '已验证' : '待验证' },
      ];
      reasoning = `商业模式${modelScore}分，财务纪律${financialScore}分，规模化${scaleScore}分。`;
      break;
    }
    case 'd6': {
      const bonusScore = Math.min(project.empowermentAreas.length * 2.5, 15);
      subScores = project.empowermentAreas.map((area, i) => ({
        subId: `s6.${i + 1}`,
        subName: area,
        subWeight: Math.round(100 / project.empowermentAreas.length),
        score: 3,
        evidence: `与${area}匹配`,
      }));
      reasoning = `赋能匹配${project.empowermentAreas.length}个板块，附加分${bonusScore}分。`;
      break;
    }
    default:
      subScores = config.map(c => ({ subId: c.subId, subName: c.subName, subWeight: c.subWeight, score: 3, evidence: '默认评分' }));
  }

  const avgScore = subScores.reduce((s, sub) => s + sub.score * (sub.subWeight / 100), 0);
  const weightMap: Record<string, number> = { d1: 30, d2: 25, d3: 20, d4: 15, d5: 10, d6: 0 };

  return {
    dimensionId,
    dimensionName,
    dimensionNameEn: dimensionId === 'd1' ? 'Technology Assets' :
      dimensionId === 'd2' ? 'Team Execution' :
      dimensionId === 'd3' ? 'Market Readiness' :
      dimensionId === 'd4' ? 'Industry Fit' :
      dimensionId === 'd5' ? 'Business Maturity' : 'Empowerment Fit',
    weight: weightMap[dimensionId] || 0,
    score: Math.min(5, Math.max(1, Math.round(avgScore * 10) / 10)),
    subScores,
    agentReasoning: reasoning,
    hitlStatus: 'pending',
  };
}

// ======== 各维度Agent ========

export async function evaluateTechAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是TechAgent，AI-Infra领域的技术资产深度评估专家。你精通半导体、光电子、集成电路、先进封装、算力基础设施等领域的技术评价。

评价维度：D1 技术资产深度（权重30%）
- S1.1 技术差异化程度（35%）：评估技术的创新性、领先性、壁垒高度
- S1.2 技术成熟度TRL（25%）：评估技术就绪度（1-9级）
- S1.3 制造就绪度MRL（20%）：评估量产能力（1-10级）
- S1.4 知识产权布局（20%）：评估专利数量和质量

评分标准（1-5分）：
5分=卓越/行业顶尖，4分=优秀/显著优势，3分=良好/行业平均，2分=一般/存在不足，1分=较差/严重不符

输出格式：
{
  "subScores": [
    {"subId": "s1.1", "subName": "技术差异化程度", "subWeight": 35, "score": X, "evidence": "理由"},
    {"subId": "s1.2", "subName": "技术成熟度TRL", "subWeight": 25, "score": X, "evidence": "理由"},
    {"subId": "s1.3", "subName": "制造就绪度MRL", "subWeight": 20, "score": X, "evidence": "理由"},
    {"subId": "s1.4", "subName": "知识产权布局", "subWeight": 20, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目进行技术资产深度评价：

【项目名称】${project.name}
【产业链层级】${project.industryLayer}
【核心技术】${project.coreTech}
【TRL技术成熟度】${project.trlLevel}/9
【MRL制造就绪度】${project.mrlLevel}/10
【核心专利数量】${project.patents}项
【技术差异化】${project.differentiator}

请严格按照JSON格式输出评价结果。`;

  return runDimensionAgent(project, 'd1', '技术资产深度', systemPrompt, userPrompt, [
    { subId: 's1.1', subName: '技术差异化程度', subWeight: 35 },
    { subId: 's1.2', subName: '技术成熟度TRL', subWeight: 25 },
    { subId: 's1.3', subName: '制造就绪度MRL', subWeight: 20 },
    { subId: 's1.4', subName: '知识产权布局', subWeight: 20 },
  ], step, onUpdate);
}

export async function evaluateTeamAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是TeamAgent，早期硬科技创业团队评估专家。你擅长通过创始人背景、团队结构、行业经验等维度评估团队的执行力与心力。

评价维度：D2 团队心力与执行力（权重25%）
- S2.1 创始人-市场匹配度（40%）：评估创始人在该领域的专业深度和成功经历
- S2.2 团队完整性与凝聚力（30%）：评估团队规模、职能覆盖、合作历史
- S2.3 心力、认知与战略能力（30%）：评估创始人的战略视野、认知深度和韧性

评分标准（1-5分）：
5分=卓越/行业顶尖，4分=优秀/显著优势，3分=良好/行业平均，2分=一般/存在不足，1分=较差/严重不符

输出格式：
{
  "subScores": [
    {"subId": "s2.1", "subName": "创始人-市场匹配度", "subWeight": 40, "score": X, "evidence": "理由"},
    {"subId": "s2.2", "subName": "团队完整性与凝聚力", "subWeight": 30, "score": X, "evidence": "理由"},
    {"subId": "s2.3", "subName": "心力、认知与战略能力", "subWeight": 30, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目的团队进行评价：

【项目名称】${project.name}
【创始人背景】${project.founderBackground}
【核心团队人数】${project.teamSize}人
【核心技术】${project.coreTech}
【融资阶段】${project.stage}
【差异化策略】${project.differentiator}

请严格按照JSON格式输出评价结果。`;

  return runDimensionAgent(project, 'd2', '团队心力与执行力', systemPrompt, userPrompt, [
    { subId: 's2.1', subName: '创始人-市场匹配度', subWeight: 40 },
    { subId: 's2.2', subName: '团队完整性与凝聚力', subWeight: 30 },
    { subId: 's2.3', subName: '心力、认知与战略能力', subWeight: 30 },
  ], step, onUpdate);
}

export async function evaluateMarketAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是MarketAgent，AI-Infra市场分析与竞争格局研究专家。你精通TAM/SAM/SOM市场分析框架和竞争战略分析。

评价维度：D3 市场就绪度（权重20%）
- S3.1 目标市场规模TAM（35%）：评估潜在市场规模和增长率
- S3.2 竞争格局与差异化（30%）：评估市场竞争态势和差异化定位
- S3.3 客户验证与traction（35%）：评估客户验证程度和商业牵引力

评分标准（1-5分）：
5分=卓越/行业顶尖，4分=优秀/显著优势，3分=良好/行业平均，2分=一般/存在不足，1分=较差/严重不符

输出格式：
{
  "subScores": [
    {"subId": "s3.1", "subName": "目标市场规模TAM", "subWeight": 35, "score": X, "evidence": "理由"},
    {"subId": "s3.2", "subName": "竞争格局与差异化", "subWeight": 30, "score": X, "evidence": "理由"},
    {"subId": "s3.3", "subName": "客户验证与traction", "subWeight": 35, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目的市场就绪度进行评价：

【项目名称】${project.name}
【TAM潜在市场】${project.tam}亿元
【SAM可服务市场】${project.sam}亿元
【SOM可获得市场】${project.som}亿元
【竞争对手】${project.competitors || '未填写'}
【差异化策略】${project.differentiator}
【是否有付费客户】${project.hasCustomers ? '是' : '否'}
【ARR年收入】${project.arr}万元
【产业链层级】${project.industryLayer}

请严格按照JSON格式输出评价结果。`;

  return runDimensionAgent(project, 'd3', '市场就绪度', systemPrompt, userPrompt, [
    { subId: 's3.1', subName: '目标市场规模TAM', subWeight: 35 },
    { subId: 's3.2', subName: '竞争格局与差异化', subWeight: 30 },
    { subId: 's3.3', subName: '客户验证与traction', subWeight: 35 },
  ], step, onUpdate);
}

export async function evaluateIndustryAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是IndustryAgent，AI-Infra产业政策与投资策略专家。你精通国富AI-Infra投资基金的投资方向、国产替代战略和产业链分析。

国富AI-Infra基金投资方向：
- 芯片硬件：存算一体、RISC-V、硅光/CPO、AI硬件
- 芯片支撑：芯片液冷、热界面材料、冷却微泵、微通道MLCP、相变换热、高压直流、PSU电源、氮化镓、固态变压器SST、固态电池
- 算力调度：跨异构平台、MLOps、具身数据、仿真训练
- AI智能体：AI For Science、物理AI、Agent OS、AI+行业
- 集群/边缘资源：算力运营、边缘计算、数据运营、资产运营
- 能源/未来算力：燃气轮机、源网荷储、算电协同、量子冷却、超导磁体

评价维度：D4 产业契合度（权重15%）
- S4.1 基金投资方向匹配度（40%）：评估与基金五大方向的匹配程度
- S4.2 国产替代紧迫度（35%）：评估是否属于卡脖子领域
- S4.3 产业链位置与价值捕获（25%）：评估在产业链中的位置

输出格式：
{
  "subScores": [
    {"subId": "s4.1", "subName": "基金投资方向匹配度", "subWeight": 40, "score": X, "evidence": "理由"},
    {"subId": "s4.2", "subName": "国产替代紧迫度", "subWeight": 35, "score": X, "evidence": "理由"},
    {"subId": "s4.3", "subName": "产业链位置与价值捕获", "subWeight": 25, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目的产业契合度进行评价：

【项目名称】${project.name}
【核心技术】${project.coreTech}
【基金方向匹配】${project.fundDirection.join('、') || '未指定'}
【差异化策略】${project.differentiator}
【产业链层级】${project.industryLayer}

请严格按照JSON格式输出评价结果。`;

  return runDimensionAgent(project, 'd4', '产业契合度', systemPrompt, userPrompt, [
    { subId: 's4.1', subName: '基金投资方向匹配度', subWeight: 40 },
    { subId: 's4.2', subName: '国产替代紧迫度', subWeight: 35 },
    { subId: 's4.3', subName: '产业链位置与价值捕获', subWeight: 25 },
  ], step, onUpdate);
}

export async function evaluateBusinessAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是BusinessAgent，硬科技企业商业化与财务分析专家。你擅长评估商业模式清晰度、财务纪律和规模化路径可行性。

评价维度：D5 商业化成熟度（权重10%）
- S5.1 商业模式清晰度（40%）：评估商业模式的清晰度和可行性
- S5.2 财务纪律与成本结构（30%）：评估财务规划和成本控制
- S5.3 规模化路径可行性（30%）：评估从单点成功到规模化扩张的路径

评分标准（1-5分）：
5分=卓越/行业顶尖，4分=优秀/显著优势，3分=良好/行业平均，2分=一般/存在不足，1分=较差/严重不符

输出格式：
{
  "subScores": [
    {"subId": "s5.1", "subName": "商业模式清晰度", "subWeight": 40, "score": X, "evidence": "理由"},
    {"subId": "s5.2", "subName": "财务纪律与成本结构", "subWeight": 30, "score": X, "evidence": "理由"},
    {"subId": "s5.3", "subName": "规模化路径可行性", "subWeight": 30, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目的商业化成熟度进行评价：

【项目名称】${project.name}
【融资阶段】${project.stage}
【是否有付费客户】${project.hasCustomers ? '是' : '否'}
【ARR年收入】${project.arr}万元
【差异化策略】${project.differentiator}
【产业链层级】${project.industryLayer}

请严格按照JSON格式输出评价结果。`;

  return runDimensionAgent(project, 'd5', '商业化成熟度', systemPrompt, userPrompt, [
    { subId: 's5.1', subName: '商业模式清晰度', subWeight: 40 },
    { subId: 's5.2', subName: '财务纪律与成本结构', subWeight: 30 },
    { subId: 's5.3', subName: '规模化路径可行性', subWeight: 30 },
  ], step, onUpdate);
}

export async function evaluateEmpowermentAgent(
  project: ProjectInfo,
  step: AgentStep,
  onUpdate: (step: AgentStep) => void
): Promise<DimensionScore> {
  const systemPrompt = `你是EmpowermentAgent，智源华创研究院赋能匹配评估专家。你精通研究院的五大赋能板块及其与AI-Infra项目的匹配逻辑。

研究院五大赋能板块：
1. AI共生平台：企业AI化转型、数据治理、知识库本地化
2. AI For Science：物理AI底座大模型、前沿材料研发（石墨烯铜/铝、TIM、超导材料）
3. AI For Patent：专利情报检索、专利申报布局、技术图谱分析
4. 创新中心：联合创新实验室、算力中心、概念验证
5. 赋能中心：首台套订单对接、生产共享、柔性生产线、小批量试制

评价维度：D6 研究院赋能匹配度（附加分0-15分）
每个匹配板块0-3分，根据匹配深度评分。

输出格式：
{
  "subScores": [
    {"subId": "s6.1", "subName": "赋能板块名称", "subWeight": 20, "score": X, "evidence": "理由"}
  ],
  "reasoning": "综合分析",
  "dimensionScore": X.X
}`;

  const userPrompt = `请对以下AI-Infra早期项目的研究院赋能匹配度进行评价：

【项目名称】${project.name}
【核心技术】${project.coreTech}
【产业链层级】${project.industryLayer}
【TRL技术成熟度】${project.trlLevel}/9
【MRL制造就绪度】${project.mrlLevel}/10
【赋能板块匹配】${project.empowermentAreas.join('、') || '未指定'}

请严格按照JSON格式输出评价结果。每个匹配的赋能板块给出0-3分的评分。`;

  const subConfigs = project.empowermentAreas.length > 0 
    ? project.empowermentAreas.map((area, i) => ({ subId: `s6.${i+1}`, subName: area, subWeight: Math.round(100 / project.empowermentAreas.length) }))
    : [{ subId: 's6.1', subName: '赋能匹配', subWeight: 100 }];

  return runDimensionAgent(project, 'd6', '研究院赋能匹配度', systemPrompt, userPrompt, subConfigs, step, onUpdate);
}
