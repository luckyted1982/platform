import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { researchReports } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

async function callDeepSeek(messages: any[]) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json() as { choices: [{ message: { content: string } }] };
  return data.choices[0].message.content;
}

export const researchRouter = createRouter({
  conduct: publicQuery
    .input(
      z.object({
        projectName: z.string().min(1),
        query: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { projectName, query } = input;

      const systemPrompt = `你是ZETA-Score AI Agent系统中的专业项目调研分析师。你的任务是对给定的AI-Infra领域项目进行深度调研分析。

你需要从以下四个维度进行全面调研，并通过多源信息交叉验证确保内容的准确性和可靠性：

## 调研框架

### 维度1：基础信息 (Basic Info)
- 公司全称、成立时间、注册地
- 核心业务定位与商业模式
- 产业链层级（基础层/平台层/应用层）
- 融资阶段与历史融资情况
- 创始人及核心管理团队背景

### 维度2：技术与团队 (Technology & Team)
- 核心技术原理与创新点
- 技术壁垒与护城河分析
- 核心团队规模与人才密度
- 核心专利布局与技术成熟度（TRL）
- 制造就绪度（MRL）评估
- 研发团队背景与学术产出

### 维度3：市场与竞争 (Market & Competition)
- TAM/SAM/SOM市场规模测算
- 目标市场定位与细分领域
- 竞争格局分析（主要竞争对手对比）
- 差异化竞争策略与核心优势
- 已有客户/收入验证情况
- 市场进入壁垒与增长驱动因素

### 维度4：投资方向与赋能匹配 (Investment & Empowerment Fit)
- 与AI-Infra基金投资方向的匹配度
  * 评估领域：存算一体、RISC-V、硅光/CPO、AI硬件、芯片液冷、热界面材料、冷却微泵、快接头/阀、微通道MLCP、相变换热、冷却液材料、液态金属、3D打印冷却、高压直流、PSU电源、Sidecar、电力控制、氮化镓、固态变压器SST、固态电池、电池监控、燃气轮机、液化天然气LNG、源网荷储、算电协同、量子冷却、太空算力、超导磁体、可控核聚变、算力运营、边缘计算、数据运营、资产运营、算力调度、MLOps、具身数据、仿真训练、AI For Science、物理AI、Agent OS、AI+行业
- 与研究院赋能板块的匹配度
  * 评估板块：AI共生平台、AI For Science、AI For Patent、创新中心（联合实验室/算力中心）、赋能中心（首台套/生产共享）
- 潜在合作场景与价值创造点

## 输出格式要求

请严格按照以下JSON格式输出调研结果（不要包含任何其他文本，只输出JSON）：

{
  "report": "调研报告正文（Markdown格式，包含标题、分节、详细分析内容）",
  "fourDimensions": {
    "basicInfo": {
      "companyName": "公司全称",
      "foundedYear": "成立时间",
      "location": "注册地",
      "businessModel": "商业模式",
      "chainLevel": "产业链层级",
      "fundingStage": "融资阶段",
      "founderBackground": "创始人背景"
    },
    "techAndTeam": {
      "coreTech": "核心技术描述",
      "techBarrier": "技术壁垒",
      "teamSize": "团队规模（数字）",
      "patents": "专利数量（数字）",
      "trl": "TRL成熟度（1-9数字）",
      "mrl": "MRL就绪度（1-10数字）",
      "rdBackground": "研发团队背景"
    },
    "marketAndCompetition": {
      "tam": "TAM市场规模（亿元数字）",
      "sam": "SAM市场规模（亿元数字）",
      "som": "SOM市场规模（亿元数字）",
      "targetMarket": "目标市场",
      "competitors": "主要竞争对手",
      "differentiation": "差异化策略",
      "payingCustomers": "已有付费客户",
      "growthDrivers": "增长驱动因素"
    },
    "investmentFit": {
      "fundDirections": ["匹配的投资方向1", "匹配的投资方向2"],
      "instituteCapabilities": ["匹配的赋能板块1", "匹配的赋能板块2"],
      "cooperationScenarios": "潜在合作场景",
      "valueCreation": "价值创造点"
    }
  },
  "sources": ["信息来源1", "信息来源2", "信息来源3"]
}

注意：
1. 所有数字字段请输出纯数字（不含单位）
2. 如果某项信息无法确认，使用"待确认"或"0"
3. 调研报告要详实、专业、客观，包含你的推理过程
4. 对信息的真实性进行自我评估，标注不确定的信息`;

      const userPrompt = `请对以下项目进行深度调研分析：

项目名称：${projectName}
用户描述/查询：${query}

请按照上述四个维度进行全面调研，输出JSON格式的结果。`;

      const result = await callDeepSeek([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      let parsed;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(result);
        }
      } catch {
        parsed = {
          report: result,
          fourDimensions: {
            basicInfo: {},
            techAndTeam: {},
            marketAndCompetition: {},
            investmentFit: {},
          },
          sources: [],
        };
      }

      // 保存到数据库
      const db = getDb();
      await db.insert(researchReports).values({
        projectId: 0,
        projectName,
        query,
        reportContent: parsed.report || result,
        fourDimensions: parsed.fourDimensions || {},
        sources: parsed.sources || [],
      });

      return {
        report: parsed.report || result,
        fourDimensions: parsed.fourDimensions || {},
        sources: parsed.sources || [],
      };
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(researchReports)
      .orderBy(desc(researchReports.createdAt));
  }),

  getByProjectId: publicQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(researchReports)
        .where(eq(researchReports.projectId, input.projectId))
        .orderBy(desc(researchReports.createdAt));
    }),
});
