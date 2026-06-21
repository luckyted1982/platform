// ZETA-Score 评价体系类型定义

export type ProjectStage = 'angel' | 'pre_a' | 'a' | 'b' | 'c' | 'ipo';
export type IndustryLayer = 'base' | 'platform' | 'application';
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';
export type HITLStatus = 'pending' | 'approved' | 'rejected' | 'modified';

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  industryLayer: IndustryLayer;
  stage: ProjectStage;
  teamSize: number;
  founderBackground: string;
  coreTech: string;
  patents: number;
  trlLevel: number;
  mrlLevel: number;
  tam: number; // 亿元
  sam: number;
  som: number;
  hasCustomers: boolean;
  arr: number; // 万元
  competitors: string;
  differentiator: string;
  fundDirection: string[];
  empowermentAreas: string[];
  createdAt: Date;
}

export interface DimensionScore {
  dimensionId: string;
  dimensionName: string;
  dimensionNameEn: string;
  weight: number;
  score: number; // 1-5
  subScores: SubScore[];
  agentReasoning: string;
  hitlStatus: HITLStatus;
  humanAdjustedScore?: number;
  adjustmentReason?: string;
}

export interface SubScore {
  subId: string;
  subName: string;
  subWeight: number;
  score: number;
  evidence: string;
}

export interface AgentStep {
  agentId: string;
  agentName: string;
  agentIcon: string;
  status: AgentStatus;
  progress: number;
  messages: AgentMessage[];
  dimensionId?: string;
}

export interface AgentMessage {
  type: 'thinking' | 'action' | 'result' | 'warning';
  content: string;
  timestamp: number;
}

export interface ZetaResult {
  projectId: string;
  baseScore: number; // 0-100
  empowermentBonus: number; // 0-15
  totalScore: number; // 0-115
  grade: Grade;
  dimensions: DimensionScore[];
  agentSteps: AgentStep[];
  riskPoints: string[];
  recommendation: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ProjectRecord {
  project: ProjectInfo;
  result: ZetaResult | null;
  status: 'draft' | 'evaluating' | 'hitl_review' | 'completed';
}

export const STAGE_LABELS: Record<ProjectStage, string> = {
  angel: '天使轮',
  pre_a: 'Pre-A轮',
  a: 'A轮',
  b: 'B轮',
  c: 'C轮',
  ipo: 'Pre-IPO',
};

export const LAYER_LABELS: Record<IndustryLayer, string> = {
  base: '基础层（芯片/冷却/供电）',
  platform: '平台层（调度/芯片设计）',
  application: '应用层（AI+行业/Agent）',
};

export const GRADE_CONFIG: Record<Grade, { label: string; color: string; bg: string; action: string }> = {
  S: { label: 'S级 - 优先投资', color: '#C9A96E', bg: '#C9A96E20', action: '立即启动尽调' },
  A: { label: 'A级 - 优质标的', color: '#7B6D8D', bg: '#7B6D8D20', action: '重点跟进' },
  B: { label: 'B级 - 条件性跟进', color: '#4A5568', bg: '#4A556820', action: '需验证关键假设' },
  C: { label: 'C级 - 观察类', color: '#718096', bg: '#71809620', action: '暂不投入资源' },
  D: { label: 'D级 - 不建议投资', color: '#E53E3E', bg: '#E53E3E20', action: '放弃' },
};

export const DIMENSIONS = [
  { id: 'd1', name: '技术资产深度', nameEn: 'Technology Assets', key: 'TA', weight: 30 },
  { id: 'd2', name: '团队心力与执行力', nameEn: 'Team Execution', key: 'TE', weight: 25 },
  { id: 'd3', name: '市场就绪度', nameEn: 'Market Readiness', key: 'MR', weight: 20 },
  { id: 'd4', name: '产业契合度', nameEn: 'Industry Fit', key: 'IF', weight: 15 },
  { id: 'd5', name: '商业化成熟度', nameEn: 'Business Maturity', key: 'BM', weight: 10 },
  { id: 'd6', name: '研究院赋能匹配度', nameEn: 'Empowerment Fit', key: 'EF', weight: 0, isBonus: true },
];

export const FUND_DIRECTIONS = [
  // 芯片硬件
  '存算一体',
  'RISC-V',
  '硅光/CPO',
  'AI硬件',
  // 算力冷却
  '芯片液冷',
  '热界面材料',
  '冷却微泵',
  '快接头/阀',
  '微通道MLCP',
  '相变换热',
  '冷却液材料',
  '液态金属',
  '3D打印冷却',
  // 供电
  '高压直流',
  'PSU电源',
  'Sidecar',
  '电力控制',
  '氮化镓',
  '固态变压器SST',
  '固态电池',
  '电池监控',
  // 能源/未来算力
  '燃气轮机',
  '液化天然气LNG',
  '源网荷储',
  '算电协同',
  '量子冷却',
  '太空算力',
  '超导磁体',
  '可控核聚变',
  // 算力运营/资源
  '算力运营',
  '边缘计算',
  '数据运营',
  '资产运营',
  // 算力平台
  '算力调度',
  'MLOps',
  '具身数据',
  '仿真训练',
  // AI智能体/模型
  'AI For Science',
  '物理AI',
  'Agent OS',
  'AI+行业',
];

export const EMPOWERMENT_AREAS = [
  'AI共生平台',
  'AI For Science',
  'AI For Patent',
  '创新中心（联合实验室/算力中心）',
  '赋能中心（首台套/生产共享）',
];
