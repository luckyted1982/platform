import { useState } from "react";

// 服务包数据（去掉价格，保留服务流程）
const SERVICE_TIERS = [
  {
    id: "seed",
    tier: "种子期启航包",
    flow: "法律+知识产权+财务基础+政策导航",
    color: "border-gray-600 bg-gray-800/30",
    hoverColor: "hover:border-gray-500 hover:bg-gray-800/50",
    details: {
      title: "种子期启航包",
      subtitle: "为初创科技企业提供基础合规与创新启航服务",
      services: [
        {
          name: "法律合规基线诊断",
          desc: "对企业股权结构、劳动用工、合同管理、数据安全等进行全面体检，识别早期法律风险，出具合规差距分析报告与整改建议。涵盖创始人股权分配合理性、期权池预留方案、核心员工竞业限制设计等关键事项。",
        },
        {
          name: "知识产权基础保护",
          desc: "核心商标检索与注册（1-3类）、软件著作权登记2-3件、专利申请前评估（1项核心技术）、商业秘密保护制度模板。在最小预算内建立IP基础，防止产品上线后发现商标已被抢注的被动局面。",
        },
        {
          name: "财务基础规范",
          desc: "研发经费辅助账模板搭建、研发费用归集辅导、加计扣除政策适用性评估。帮助企业建立符合高企认定要求的研发费用管理体系，确保研发费用占比达到≥5%的门槛要求。",
        },
        {
          name: "政策导航与申报规划",
          desc: "科技型中小企业评价入库辅导、区域科技政策匹配分析、3年资质申报路线图规划。帮助企业了解可享受的政策红利，制定分阶段申报计划，最大化政策收益。",
        },
      ],
    },
  },
  {
    id: "angel",
    tier: "天使期加速包",
    flow: "+高企认定+贯标+融资BP+治理升级",
    color: "border-blue-500/30 bg-blue-500/5",
    hoverColor: "hover:border-blue-500/50 hover:bg-blue-500/10",
    details: {
      title: "天使期加速包",
      subtitle: "助力企业完成核心资质认定，打通融资通道",
      services: [
        {
          name: "高新技术企业认定全流程",
          desc: "知识产权规划布局、科技成果转化材料编制、研发费用专项审计辅导、组织管理制度建设、高企申报书编制与系统填报。全流程辅导确保一次通过，同步规划3年高企维护方案。",
        },
        {
          name: "知识产权贯标辅导（GB/T 29490）",
          desc: "按照GB/T 29490-2023新版标准，建立企业知识产权管理体系，涵盖知识产权获取、维护、运用、保护全生命周期管理。贯标认证企业可获得5-30万元不等的地方政府奖励。",
        },
        {
          name: "融资BP编制与FA对接",
          desc: "基于企业技术优势与市场定位，编制专业融资商业计划书，包括技术壁垒分析、市场空间测算、竞争格局梳理、财务预测模型。对接专业财务顾问机构，匹配天使轮/Pre-A轮投资机构资源。",
        },
        {
          name: "公司治理升级",
          desc: "股东协议优化、章程修订、三会一层治理机制建设、股权激励方案设计。帮助企业从创始人主导的粗放管理向规范化公司治理转型，为后续融资做好治理准备。",
        },
      ],
    },
  },
  {
    id: "prea",
    tier: "Pre-A跃迁包",
    flow: "+专精特新+政府基金+财务合规深度",
    color: "border-purple-500/30 bg-purple-500/5",
    hoverColor: "hover:border-purple-500/50 hover:bg-purple-500/10",
    details: {
      title: "Pre-A跃迁包",
      subtitle: "助力企业冲击专精特新，对接政府产业基金",
      services: [
        {
          name: "专精特新企业认定与培育",
          desc: "专业化、精细化、特色化、新颖化四维度指标诊断与提升方案。细分市场排名证明获取、关键技术指标论证、申报书编制。同步规划专精特新「小巨人」申报路径。",
        },
        {
          name: "政府引导基金/产业基金对接",
          desc: "国家级/省级/市级政府引导基金申报与对接。国家创业投资引导基金财政出资1000亿元，对种子期初创期企业投资规模不低于70%且估值要求5亿元以下。帮助企业匹配最合适的政府基金资源。",
        },
        {
          name: "财务合规深度建设",
          desc: "研发费用归集深度优化、收入确认合规性审查、关联交易规范、税务健康检查。按照科创板/北交所上市财务规范要求，提前建立合规财务体系，降低后续IPO审核风险。",
        },
        {
          name: "知识产权高价值培育",
          desc: "1-2项核心发明专利的深度培育、专利微导航分析（1个技术方向）、FTO自由实施分析（产品上市前）。构建以核心专利为中心的专利保护网，提升企业估值锚点。",
        },
      ],
    },
  },
  {
    id: "a",
    tier: "A轮冲刺包",
    flow: "+上市预备+国际专利+CVC对接",
    color: "border-amber-500/30 bg-amber-500/5",
    hoverColor: "hover:border-amber-500/50 hover:bg-amber-500/10",
    details: {
      title: "A轮冲刺包",
      subtitle: "全面对接资本市场，布局国际化知识产权",
      services: [
        {
          name: "上市路径规划与预备",
          desc: "北交所挂牌→转板科创板/创业板渐进式路径设计。上市合规差距分析、券商/会所/律所选聘辅导、IPO申报材料预准备。北交所审核周期平均仅9个月、过会率最高，为A轮前企业提供最优上市路径。",
        },
        {
          name: "国际知识产权布局",
          desc: "PCT国际专利申请、马德里国际商标注册、海外专利布局策略。针对目标市场（美/欧/日/韩）进行FTO分析，规避侵权风险。知识产权资产评估与融资方案设计，支持专利质押融资。",
        },
        {
          name: "CVC产业资本对接",
          desc: "对接大型企业战略投资部门（CVC），包括华为哈勃、小米产投、腾讯投资等。CVC不仅提供资金，更带来产业订单、技术合作、供应链资源等战略价值。帮助企业获得产业背书与业务协同。",
        },
        {
          name: "股权架构优化与融资谈判",
          desc: "创始人控制权设计（AB股/投票权委托）、Term Sheet条款解读与谈判支持、估值模型搭建与谈判策略制定。确保企业在融资过程中最大化自身利益，避免不利条款陷阱。",
        },
      ],
    },
  },
];

// 九大服务模块数据（含细分服务详细内容）
const SERVICE_MODULES = [
  {
    id: "rd",
    icon: "⚙️",
    title: "研发管理与技术创新",
    color: "blue",
    items: [
      {
        name: "技术路线规划与产品战略制定",
        desc: "围绕企业愿景与商业目标，梳理技术路线，明确产品演进方向",
        detail: "服务内容：\n\n1. 企业技术现状诊断：评估现有技术栈、研发能力、技术债务状况\n2. 行业技术趋势分析：基于专利情报与市场数据，识别技术发展方向\n3. 技术路线图制定：明确3-5年技术演进路径，设定关键技术里程碑\n4. 产品战略匹配：将技术路线与商业目标对齐，确定产品优先级\n5. 技术投资决策建议：评估各技术方向的ROI，优化研发资源配置\n\n交付物：技术路线图文档、产品战略建议书、技术投资决策报告\n周期：2-3周",
      },
      {
        name: "IPD+敏捷融合研发管理体系设计",
        desc: "构建跨部门协同研发机制，提升研发效率与产品成功率",
        detail: "服务内容：\n\n1. 研发管理成熟度评估：参考CMMI 1-3级框架进行快速诊断\n2. IPD核心思想导入：培训\"研发是投资行为\"和\"基于需求的研发\"核心理念\n3. 敏捷实践融合：设计两周冲刺机制，建立敏捷看板与站会制度\n4. 跨部门协同流程：建立产品-研发-测试-运营的端到端协作机制\n5. 需求管理模板：设计\"用户场景→功能需求→技术方案\"三层文档评审流程\n\n交付物：研发管理体系设计文档、流程模板库、敏捷实践指南\n周期：3-5天工作坊 + 1个月落地辅导",
      },
      {
        name: "研发经费归集与加计扣除辅导",
        desc: "规范研发费用管理，最大化享受国家税收优惠政策",
        detail: "服务内容：\n\n1. 研发费用辅助账搭建：建立符合高企认定要求的研发费用归集体系\n2. 人员工时记录规范：设计研发人员工时分配与记录机制\n3. 加计扣除政策适用：评估100%加计扣除政策适用性，计算节税收益\n4. 月度审核与季度申报：持续跟踪研发费用归集质量\n5. 高企研发费用占比达标：确保研发费用占比达到≥5%门槛\n\n交付物：研发费用辅助账模板、月度审核报告、加计扣除申报方案\n周期：按月订阅服务",
      },
      {
        name: "技术情报分析与竞争态势研判",
        desc: "通过专利分析与技术扫描，把握行业技术趋势",
        detail: "服务内容：\n\n1. 专利情报监控：追踪核心技术领域的专利申请动态\n2. 竞品技术扫描：分析主要竞争对手的技术布局与研发方向\n3. 技术趋势预测：基于专利数据与市场信息预测技术演进方向\n4. FTO侵权预警：评估产品上市前的自由实施风险\n5. 技术机会识别：发现技术空白点与潜在创新方向\n\n交付物：技术情报月报、竞争态势分析报告、FTO风险评估报告\n周期：订阅制（月度/季度）",
      },
      {
        name: "研发标准体系导入",
        desc: "CMMI/ISO体系认证辅导，提升研发管理能力",
        detail: "服务内容：\n\n1. CMMI等级评估：评估企业当前研发管理成熟度等级\n2. 体系差距分析：对比目标等级要求，识别改进空间\n3. 过程改进计划：制定分阶段的过程改进路线图\n4. ISO 9001/27001认证辅导：质量管理体系/信息安全管理体系建设\n5. 认证申报支持：协助完成认证审核与材料准备\n\n交付物：成熟度评估报告、过程改进计划、认证申报材料\n周期：2-3个月",
      },
      {
        name: "技术商业化路径设计",
        desc: "从技术成果到市场产品的转化路径规划",
        detail: "服务内容：\n\n1. 技术成果评估：评估技术的市场价值与商业化可行性\n2. 目标市场分析：确定技术的目标客户群体与应用场景\n3. 商业模式设计：设计技术变现的商业模式与定价策略\n4. 转化路径规划：制定从实验室到市场的分阶段转化计划\n5. 合作伙伴对接：对接概念验证中心、技术转移机构等资源\n\n交付物：技术商业化方案、市场分析报告、合作伙伴对接清单\n周期：2-4周",
      },
    ],
  },
  {
    id: "ip",
    icon: "️",
    title: "知识产权战略与资产管理",
    color: "purple",
    items: [
      {
        name: "专利布局战略规划",
        desc: "围绕核心技术构建专利保护网，形成知识产权壁垒",
        detail: "服务内容：\n\n1. 核心技术拆解：分析企业核心技术的创新点与技术特征\n2. 专利组合设计：设计\"核心专利+外围专利\"的组合布局策略\n3. 专利地图绘制：绘制技术领域的专利分布地图，识别空白点\n4. 申请策略制定：确定专利申请的时间、地域、类型策略\n5. 专利质量提升：指导撰写高质量专利权利要求，扩大保护范围\n\n交付物：专利布局规划报告、专利组合设计方案、专利申请策略书\n周期：2-3周",
      },
      {
        name: "知识产权贯标辅导",
        desc: "GB/T 29490知识产权管理体系认证辅导",
        detail: "服务内容：\n\n1. 贯标现状诊断：评估企业知识产权管理现状与差距\n2. 体系文件编制：编制知识产权管理手册、程序文件、作业指导书\n3. 内部审核培训：培训内部审核员，建立内部审核机制\n4. 管理评审支持：协助进行管理评审，持续改进体系运行\n5. 认证申报辅导：协助完成外部认证审核\n\n交付物：知识产权管理体系文件、内部审核报告、认证申报材料\n周期：3-6个月",
      },
      {
        name: "高价值专利培育与运营",
        desc: "重点发明专利培育、专利池构建与许可运营",
        detail: "服务内容：\n\n1. 高价值专利识别：从现有专利中筛选具有高商业价值的专利\n2. 专利质量提升：通过权利要求优化、说明书完善提升专利价值\n3. 专利池构建：围绕核心技术构建专利池，形成组合优势\n4. 专利许可运营：设计专利许可策略，实现专利资产变现\n5. 专利质押融资：协助办理专利质押贷款，盘活知识产权资产\n\n交付物：高价值专利评估报告、专利池构建方案、许可运营方案\n周期：1-3个月",
      },
      {
        name: "专利导航与侵权预警分析",
        desc: "FTO分析、竞品专利监控、侵权风险预警",
        detail: "服务内容：\n\n1. FTO自由实施分析：评估产品上市前的专利侵权风险\n2. 竞品专利监控：持续监控主要竞争对手的专利申请动态\n3. 侵权风险评估：对疑似侵权专利进行权利要求比对分析\n4. 规避设计方案：针对高风险专利设计技术规避方案\n5. 无效宣告支持：对阻碍性专利提起无效宣告请求\n\n交付物：FTO分析报告、竞品专利监控报告、侵权风险评估报告\n周期：2-4周",
      },
      {
        name: "知识产权质押融资与证券化对接",
        desc: "专利质押贷款、知识产权证券化融资服务",
        detail: "服务内容：\n\n1. 知识产权资产评估：对企业专利、商标等知识产权进行价值评估\n2. 质押融资方案设计：设计专利质押贷款方案，匹配金融机构\n3. 证券化产品设计：设计知识产权证券化产品，实现批量融资\n4. 贴息政策申请：协助申请知识产权质押融资贴息政策\n5. 融资对接服务：对接银行、担保公司、证券化平台等金融机构\n\n交付物：知识产权评估报告、质押融资方案、证券化产品设计书\n周期：1-2个月",
      },
      {
        name: "国际知识产权布局",
        desc: "PCT申请、海外专利布局、国际商标注册",
        detail: "服务内容：\n\n1. PCT国际专利申请：通过PCT途径提交国际专利申请\n2. 海外专利布局策略：根据目标市场制定专利布局策略\n3. 国际商标注册：通过马德里体系进行国际商标注册\n4. 海外FTO分析：对目标市场进行自由实施分析\n5. 海外维权支持：协助处理海外知识产权纠纷\n\n交付物：PCT申请文件、海外布局策略书、国际商标注册方案\n周期：3-6个月",
      },
      {
        name: "知识产权示范/优势企业申报辅导",
        desc: "国家知识产权示范企业/优势企业认定辅导",
        detail: "服务内容：\n\n1. 申报条件评估：评估企业是否符合示范/优势企业申报条件\n2. 差距分析与提升：识别差距并制定提升方案\n3. 申报材料编制：编制申报书、附件材料等\n4. 答辩辅导：协助准备答辩材料，进行模拟答辩\n5. 后续维护指导：获得认定后的维护与复评指导\n\n交付物：申报条件评估报告、申报材料、答辩辅导方案\n周期：2-3个月",
      },
    ],
  },
  {
    id: "qual",
    icon: "🏆",
    title: "企业资质梯度培育与政策申报",
    color: "green",
    items: [
      {
        name: "科技型中小企业评价入库",
        desc: "科小评价指标诊断、申报材料编制、系统填报",
        detail: "服务内容：\n\n1. 科小评价指标诊断：评估企业是否符合科技型中小企业标准\n2. 差距分析与提升：针对不达标指标制定提升方案\n3. 申报材料编制：编制科小评价申报书及相关附件\n4. 系统填报指导：协助完成国家科技型中小企业评价系统填报\n5. 后续维护：入库后的年度维护与指标跟踪\n\n交付物：评价指标诊断报告、申报材料、系统填报指导\n周期：1-2周",
      },
      {
        name: "高新技术企业认定全流程申报",
        desc: "知识产权规划、成果转化、研发费用、组织管理等全流程辅导",
        detail: "服务内容：\n\n1. 高企认定条件评估：全面评估企业是否符合高企认定条件\n2. 知识产权规划：确保知识产权数量与质量满足评分要求\n3. 科技成果转化材料：编制科技成果转化清单与证明材料\n4. 研发费用专项审计：协助完成研发费用专项审计\n5. 组织管理制度建设：建立符合高企要求的研发组织管理体系\n6. 申报书编制与系统填报：编制高企认定申报书并完成系统填报\n\n交付物：高企认定申报全套材料、专项审计报告、组织管理制度文件\n周期：3-6个月",
      },
      {
        name: "专精特新企业认定与培育",
        desc: "专业化、精细化、特色化、新颖化指标诊断与提升",
        detail: "服务内容：\n\n1. 专精特新指标诊断：评估企业在专业化、精细化、特色化、新颖化四方面的表现\n2. 细分市场定位：帮助企业明确细分市场定位与竞争优势\n3. 关键技术论证：论证企业关键技术的先进性与独特性\n4. 申报材料编制：编制专精特新认定申报书\n5. 培育提升方案：制定专精特新培育提升方案\n\n交付物：指标诊断报告、申报材料、培育提升方案\n周期：2-3个月",
      },
      {
        name: "专精特新「小巨人」申报辅导",
        desc: "细分市场排名证明、关键技术指标论证、申报书编制",
        detail: "服务内容：\n\n1. 小巨人申报条件评估：评估企业是否符合小巨人申报条件\n2. 细分市场排名证明：协助获取细分市场排名证明材料\n3. 关键技术指标论证：论证企业关键技术的先进性与行业地位\n4. 财务数据梳理：梳理企业财务数据，确保符合申报要求\n5. 申报书编制与答辩辅导：编制申报书并协助准备答辩\n\n交付物：申报条件评估报告、申报材料、答辩辅导方案\n周期：3-6个月",
      },
      {
        name: "企业技术中心/工程研究中心申报",
        desc: "研发设备、人员、投入等指标达标辅导",
        detail: "服务内容：\n\n1. 申报条件评估：评估企业是否符合技术中心/工程研究中心申报条件\n2. 研发条件建设：协助企业完善研发设备、人员、场地等条件\n3. 研发投入归集：规范研发投入归集，确保达到申报要求\n4. 申报材料编制：编制申报书及相关附件材料\n5. 现场评审准备：协助准备现场评审材料\n\n交付物：申报条件评估报告、申报材料、现场评审准备方案\n周期：3-6个月",
      },
    ],
  },
  {
    id: "capital",
    icon: "💰",
    title: "资本路径设计与估值管理",
    color: "amber",
    items: [
      {
        name: "科技初创企业估值诊断与对标分析",
        desc: "可比公司法、DCF、风险投资法多维度估值",
        detail: "服务内容：\n\n1. 企业价值评估：采用可比公司法、DCF模型、风险投资法进行多维度估值\n2. 行业对标分析：与同行业可比公司进行估值对标\n3. 估值驱动因素分析：识别影响企业估值的关键因素\n4. 估值提升建议：提出提升企业估值的具体建议\n5. 估值报告编制：编制专业的企业估值报告\n\n交付物：企业估值报告、行业对标分析报告、估值提升建议\n周期：2-3周",
      },
      {
        name: "融资路径与节奏规划",
        desc: "种子→天使→Pre-A→A轮各阶段融资策略制定",
        detail: "服务内容：\n\n1. 融资需求分析：评估企业当前及未来融资需求\n2. 融资路径设计：设计从种子轮到A轮的融资路径\n3. 融资节奏规划：确定各轮融资的时间节点与金额\n4. 投资人匹配：根据企业特点匹配适合的投资机构\n5. 融资材料准备：协助准备融资所需的各类材料\n\n交付物：融资路径规划书、投资人匹配清单、融资材料清单\n周期：2-4周",
      },
      {
        name: "FA服务对接",
        desc: "对接专业财务顾问，匹配投资机构资源",
        detail: "服务内容：\n\n1. FA机构筛选：根据企业特点筛选适合的专业财务顾问机构\n2. FA服务对接：协助企业与FA机构建立合作关系\n3. 投资机构匹配：通过FA网络匹配适合的投资机构\n4. 融资过程支持：在融资过程中提供专业支持\n5. 交易条款审核：协助审核投资协议条款\n\n交付物：FA机构推荐清单、投资机构匹配清单、交易条款审核意见\n周期：1-3个月",
      },
      {
        name: "股权架构设计与融资谈判",
        desc: "创始人控制权设计、Term Sheet条款解读与谈判",
        detail: "服务内容：\n\n1. 股权架构设计：设计合理的股权架构，保障创始人控制权\n2. 期权池规划：规划员工期权池，吸引和留住核心人才\n3. Term Sheet解读：解读投资条款清单，识别关键条款风险\n4. 谈判策略制定：制定融资谈判策略，最大化企业利益\n5. 投资协议审核：审核正式投资协议，确保条款公平合理\n\n交付物：股权架构设计方案、Term Sheet解读报告、谈判策略书\n周期：2-4周",
      },
      {
        name: "政府引导基金/产业基金对接",
        desc: "国家级/省级/市级政府基金申报与对接",
        detail: "服务内容：\n\n1. 政府基金政策研究：研究各级政府引导基金政策\n2. 基金匹配分析：根据企业特点匹配适合的政府基金\n3. 申报材料编制：编制政府基金申报材料\n4. 基金对接服务：协助企业与政府基金建立联系\n5. 后续跟进支持：跟进基金投资进度，提供后续支持\n\n交付物：政府基金政策研究报告、基金匹配分析报告、申报材料\n周期：1-3个月",
      },
      {
        name: "科技信贷产品对接",
        desc: "知识产权质押贷、科信贷、人才贷等产品对接",
        detail: "服务内容：\n\n1. 信贷产品研究：研究各类科技信贷产品政策\n2. 产品匹配分析：根据企业特点匹配适合的信贷产品\n3. 贷款申请材料：协助准备贷款申请材料\n4. 银行对接服务：协助企业与银行建立联系\n5. 贷后管理支持：提供贷后管理支持\n\n交付物：信贷产品研究报告、产品匹配分析报告、贷款申请材料\n周期：1-2个月",
      },
    ],
  },
  {
    id: "research",
    icon: "🤝",
    title: "产学研合作与科技成果转化",
    color: "cyan",
    items: [
      {
        name: "产学研合作模式设计",
        desc: "联合研发、委托开发、共建实验室等模式选择",
        detail: "服务内容：\n\n1. 合作需求分析：分析企业的技术需求与合作目标\n2. 合作模式设计：设计联合研发、委托开发、共建实验室等合作模式\n3. 合作伙伴筛选：筛选适合的高校、科研院所等合作伙伴\n4. 合作协议起草：起草产学研合作协议，明确权责利\n5. 合作过程管理：协助管理合作过程，确保合作顺利\n\n交付物：合作需求分析报告、合作模式设计方案、合作协议草案\n周期：2-4周",
      },
      {
        name: "概念验证（POC）中心对接",
        desc: "科技成果概念验证、中试熟化、样品试制",
        detail: "服务内容：\n\n1. POC需求评估：评估企业科技成果的概念验证需求\n2. POC中心匹配：匹配适合的概念验证中心\n3. 验证方案设计：设计概念验证方案\n4. 验证过程支持：协助进行概念验证过程\n5. 验证结果评估：评估概念验证结果，提出后续建议\n\n交付物：POC需求评估报告、验证方案设计、验证结果评估报告\n周期：1-3个月",
      },
      {
        name: "技术经理人对接",
        desc: "专业技术经理人全程跟进成果转化过程",
        detail: "服务内容：\n\n1. 技术经理人匹配：根据企业技术特点匹配专业技术经理人\n2. 成果转化规划：制定科技成果转化规划\n3. 转化过程跟进：技术经理人全程跟进成果转化过程\n4. 资源对接服务：对接成果转化所需的各类资源\n5. 转化效果评估：评估成果转化效果\n\n交付物：技术经理人匹配方案、成果转化规划、转化效果评估报告\n周期：3-6个月",
      },
      {
        name: "科技成果评估",
        desc: "技术先进性评估、市场价值评估、转化可行性分析",
        detail: "服务内容：\n\n1. 技术先进性评估：评估技术的先进性与创新性\n2. 市场价值评估：评估技术的市场价值与商业潜力\n3. 转化可行性分析：分析技术转化的可行性与风险\n4. 转化路径设计：设计技术转化的路径与方案\n5. 评估报告编制：编制专业的科技成果评估报告\n\n交付物：技术先进性评估报告、市场价值评估报告、转化可行性分析报告\n周期：2-4周",
      },
    ],
  },
  {
    id: "legal",
    icon: "⚖️",
    title: "法律风险防控与公司治理",
    color: "red",
    items: [
      {
        name: "公司治理与股权架构设计",
        desc: "股东协议、章程设计、三会一层治理机制",
        detail: "服务内容：\n\n1. 公司治理现状诊断：评估企业公司治理现状\n2. 股权架构设计：设计合理的股权架构\n3. 股东协议起草：起草股东协议，明确股东权利义务\n4. 公司章程修订：修订公司章程，完善治理机制\n5. 三会一层建设：建立股东会、董事会、监事会、管理层治理机制\n\n交付物：公司治理诊断报告、股权架构设计方案、股东协议、公司章程\n周期：2-4周",
      },
      {
        name: "劳动用工合规与核心人才竞业限制",
        desc: "劳动合同、股权激励、竞业限制协议设计",
        detail: "服务内容：\n\n1. 劳动用工合规审查：审查企业劳动用工合规性\n2. 劳动合同模板设计：设计符合法律要求的劳动合同模板\n3. 股权激励方案设计：设计员工股权激励方案\n4. 竞业限制协议设计：设计核心员工竞业限制协议\n5. 人力资源制度完善：完善企业人力资源管理制度\n\n交付物：劳动用工合规审查报告、劳动合同模板、股权激励方案、竞业限制协议\n周期：2-4周",
      },
      {
        name: "合同管理与商业合规体系",
        desc: "合同模板库、合同审批流程、合规检查清单",
        detail: "服务内容：\n\n1. 合同管理现状诊断：评估企业合同管理现状\n2. 合同模板库建设：建立企业常用合同模板库\n3. 合同审批流程设计：设计合同审批流程\n4. 合规检查清单编制：编制商业合规检查清单\n5. 合同管理系统选型：协助选型合同管理系统\n\n交付物：合同管理诊断报告、合同模板库、审批流程、合规检查清单\n周期：2-4周",
      },
      {
        name: "数据安全与个人信息保护合规",
        desc: "数据分类分级、合规差距分析、整改方案",
        detail: "服务内容：\n\n1. 数据安全现状评估：评估企业数据安全现状\n2. 数据分类分级：对企业数据进行分类分级\n3. 合规差距分析：分析企业与数据安全法规的差距\n4. 整改方案设计：设计数据安全整改方案\n5. 隐私政策编制：编制隐私政策与用户协议\n\n交付物：数据安全评估报告、数据分类分级方案、整改方案、隐私政策\n周期：2-4周",
      },
      {
        name: "科技成果转化法律合规",
        desc: "职务科技成果权属、转化收益分配、技术合同登记",
        detail: "服务内容：\n\n1. 科技成果权属梳理：梳理企业科技成果的权属关系\n2. 转化收益分配设计：设计科技成果转化收益分配方案\n3. 技术合同起草：起草技术转让、许可等技术合同\n4. 技术合同登记：协助完成技术合同登记\n5. 合规风险评估：评估科技成果转化过程中的法律风险\n\n交付物：科技成果权属报告、收益分配方案、技术合同、合规风险评估报告\n周期：2-4周",
      },
      {
        name: "全生命周期法律风险地图与体检",
        desc: "从设立到IPO全阶段法律风险识别与防控",
        detail: "服务内容：\n\n1. 法律风险识别：识别企业从设立到IPO各阶段的法律风险\n2. 风险地图绘制：绘制企业法律风险地图\n3. 风险等级评估：评估各风险的发生概率与影响程度\n4. 防控措施设计：设计针对性的风险防控措施\n5. 定期法律体检：定期进行法律健康检查\n\n交付物：法律风险地图、风险评估报告、防控措施方案、法律体检报告\n周期：2-4周",
      },
      {
        name: "ESG治理与合规整改",
        desc: "环境社会治理体系搭建、ESG报告编制",
        detail: "服务内容：\n\n1. ESG现状评估：评估企业ESG治理现状\n2. ESG体系搭建：搭建环境、社会、治理三位一体体系\n3. ESG指标设计：设计符合行业特点的ESG指标\n4. ESG报告编制：编制ESG报告\n5. ESG合规整改：针对ESG合规问题进行整改\n\n交付物：ESG现状评估报告、ESG体系方案、ESG报告、整改方案\n周期：2-3个月",
      },
    ],
  },
  {
    id: "ai",
    icon: "🤖",
    title: "企业AI化转型与FDE部署",
    color: "pink",
    items: [
      {
        name: "AI成熟度评估",
        desc: "企业AI应用现状诊断、成熟度分级",
        detail: "服务内容：\n\n1. AI应用现状调研：调研企业当前AI应用情况\n2. AI成熟度模型：采用AI成熟度模型进行评估\n3. 成熟度分级：确定企业AI成熟度等级\n4. 差距分析：分析企业与目标等级的差距\n5. 提升建议：提出AI成熟度提升建议\n\n交付物：AI应用现状调研报告、AI成熟度评估报告、提升建议\n周期：1-2周",
      },
      {
        name: "AI应用场景识别与优先级排序",
        desc: "业务流程梳理、AI应用机会识别、ROI评估",
        detail: "服务内容：\n\n1. 业务流程梳理：梳理企业核心业务流程\n2. AI应用机会识别：识别各流程中的AI应用机会\n3. 应用场景设计：设计具体的AI应用场景\n4. ROI评估：评估各应用场景的投资回报\n5. 优先级排序：根据ROI与实施难度进行优先级排序\n\n交付物：业务流程梳理报告、AI应用场景清单、ROI评估报告、优先级排序\n周期：2-3周",
      },
      {
        name: "FDE（Fullstack Data & AI Engineering）部署",
        desc: "数据基础设施搭建、AI模型训练部署、MLOps体系建设",
        detail: "服务内容：\n\n1. 数据基础设施规划：规划企业数据基础设施\n2. 数据平台建设：建设企业数据平台\n3. AI模型训练部署：协助训练和部署AI模型\n4. MLOps体系建设：建设机器学习运维体系\n5. AI应用集成：将AI应用集成到企业系统中\n\n交付物：数据基础设施规划、数据平台建设方案、MLOps体系方案\n周期：3-6个月",
      },
      {
        name: "AI人才培训与组织能力建设",
        desc: "AI技能培训、数据文化培育、AI治理机制",
        detail: "服务内容：\n\n1. AI技能培训：为企业员工提供AI技能培训\n2. 数据文化培育：培育企业数据驱动文化\n3. AI治理机制建设：建立AI治理机制\n4. AI团队建设：协助建设AI团队\n5. AI知识管理：建立AI知识管理体系\n\n交付物：AI培训方案、数据文化建设方案、AI治理机制方案\n周期：2-3个月",
      },
    ],
  },
  {
    id: "compute",
    icon: "💻",
    title: "算力与Token服务",
    color: "indigo",
    items: [
      {
        name: "算力资源调度与优化",
        desc: "GPU/CPU算力弹性调度、成本优化方案",
        detail: "服务内容：\n\n1. 算力需求评估：评估企业算力需求\n2. 算力资源规划：规划算力资源配置\n3. 弹性调度方案设计：设计算力弹性调度方案\n4. 成本优化：优化算力使用成本\n5. 算力监控：建立算力使用监控体系\n\n交付物：算力需求评估报告、算力资源规划、调度方案、成本优化方案\n周期：2-4周",
      },
      {
        name: "Token服务与API管理",
        desc: "大模型API接入、Token用量监控、成本控制",
        detail: "服务内容：\n\n1. 大模型API接入：协助接入各类大模型API\n2. Token用量监控：建立Token用量监控体系\n3. 成本控制：优化Token使用成本\n4. API管理：管理各类API的使用\n5. 性能优化：优化API调用性能\n\n交付物：API接入方案、Token监控方案、成本控制方案\n周期：2-4周",
      },
      {
        name: "私有化部署方案",
        desc: "大模型私有化部署、数据安全保障",
        detail: "服务内容：\n\n1. 私有化部署需求评估：评估企业私有化部署需求\n2. 部署方案设计：设计大模型私有化部署方案\n3. 数据安全保障：设计数据安全保障方案\n4. 部署实施支持：协助进行部署实施\n5. 运维支持：提供部署后运维支持\n\n交付物：私有化部署需求评估、部署方案、数据安全方案\n周期：1-3个月",
      },
      {
        name: "算力-电力协同优化",
        desc: "源网荷储一体化、绿色算力方案",
        detail: "服务内容：\n\n1. 算力-电力协同评估：评估企业算力与电力协同现状\n2. 源网荷储方案设计：设计源网荷储一体化方案\n3. 绿色算力方案：设计绿色算力方案\n4. 能效优化：优化算力能效\n5. 碳足迹管理：建立算力碳足迹管理体系\n\n交付物：协同评估报告、源网荷储方案、绿色算力方案、碳足迹管理方案\n周期：2-3个月",
      },
    ],
  },
  {
    id: "zeta",
    icon: "⭐",
    title: "ZETA-Score AI Agent评价",
    color: "amber",
    items: [
      {
        name: "企业画像与能力评估",
        desc: "基于AI Agent的企业多维度画像与能力评估",
        detail: "服务内容：\n\n1. 企业信息采集：采集企业基本信息与经营数据\n2. 多维度画像：构建企业技术、团队、市场、财务等多维度画像\n3. 能力评估：评估企业各项能力水平\n4. 对标分析：与同行业企业进行对标分析\n5. 评估报告：编制企业画像与能力评估报告\n\n交付物：企业画像报告、能力评估报告、对标分析报告\n周期：1-2周",
      },
      {
        name: "定制化服务方案制定",
        desc: "根据评价结果匹配最优服务组合",
        detail: "服务内容：\n\n1. 评价结果分析：分析ZETA-Score评价结果\n2. 服务需求识别：识别企业核心服务需求\n3. 服务方案设计：设计定制化服务方案\n4. 服务组合优化：优化服务组合，最大化服务效果\n5. 实施计划制定：制定服务实施计划\n\n交付物：评价结果分析报告、定制化服务方案、实施计划\n周期：1-2周",
      },
      {
        name: "ZETA-Score智能评级",
        desc: "6+1维度综合评价，S/A/B/C/D五级评级",
        detail: "服务内容：\n\n1. 六维度评价：技术资产、团队执行力、市场就绪度、产业契合度、商业化成熟度、赋能匹配度六维度评价\n2. 附加分评估：评估研究院赋能附加分\n3. 综合评级：计算ZETA-Score综合评分，确定S/A/B/C/D等级\n4. 评级解读：解读评级结果，说明各维度表现\n5. 改进建议：提出各维度改进建议\n\n交付物：ZETA-Score评级报告、各维度评价报告、改进建议\n周期：1周",
      },
      {
        name: "成长路径规划",
        desc: "基于评价结果的企业成长路径与里程碑规划",
        detail: "服务内容：\n\n1. 成长目标设定：基于评价结果设定企业成长目标\n2. 成长路径设计：设计企业成长路径\n3. 里程碑规划：规划关键里程碑节点\n4. 资源配置建议：提出资源配置建议\n5. 风险预警：识别成长过程中的风险并预警\n\n交付物：成长目标设定、成长路径规划、里程碑计划、风险预警方案\n周期：2周",
      },
    ],
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue:    { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400" },
  purple:  { border: "border-purple-500/20", bg: "bg-purple-500/5", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-400" },
  green:   { border: "border-green-500/20", bg: "bg-green-500/5", text: "text-green-400", badge: "bg-green-500/20 text-green-400" },
  amber:   { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  cyan:    { border: "border-cyan-500/20", bg: "bg-cyan-500/5", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-400" },
  red:     { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400", badge: "bg-red-500/20 text-red-400" },
  pink:    { border: "border-pink-500/20", bg: "bg-pink-500/5", text: "text-pink-400", badge: "bg-pink-500/20 text-pink-400" },
  indigo:  { border: "border-indigo-500/20", bg: "bg-indigo-500/5", text: "text-indigo-400", badge: "bg-indigo-500/20 text-indigo-400" },
};

export function ServicesPage() {
  const [activeModule, setActiveModule] = useState(SERVICE_MODULES[0].id);
  const [selectedTier, setSelectedTier] = useState<typeof SERVICE_TIERS[0] | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ name: string; detail: string } | null>(null);
  const active = SERVICE_MODULES.find((m) => m.id === activeModule)!;
  const colors = colorMap[active.color] || colorMap.blue;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">服务矩阵</h1>
        <p className="text-gray-400">九大核心服务模块，覆盖企业全生命周期需求</p>
      </div>

      {/* Service Tiers */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SERVICE_TIERS.map((pkg) => (
          <div
            key={pkg.tier}
            onClick={() => setSelectedTier(pkg)}
            className={`${pkg.color} ${pkg.hoverColor} border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02]`}
          >
            <p className="text-sm font-semibold text-white mb-2">{pkg.tier}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{pkg.flow}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-amber-400">
              <span>查看详情</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Module Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SERVICE_MODULES.map((m) => {
          const c = colorMap[m.color] || colorMap.blue;
          const isActive = activeModule === m.id;
          return (
            <button key={m.id} onClick={() => setActiveModule(m.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isActive ? `${c.border} ${c.bg} ${c.text}` : "border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800/50"
              }`}>
              <span>{m.icon}</span>
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Module Detail */}
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{active.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{active.title}</h2>
            <p className="text-sm text-gray-400">{active.items.length}项细分服务</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {active.items.map((item) => (
            <div
              key={item.name}
              onClick={() => setSelectedItem({ name: item.name, detail: item.detail })}
              className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <h3 className="font-medium text-white text-sm mb-1.5 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                {item.name}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                <span>查看详细内容</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Tier Detail Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedTier(null)}>
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[700px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedTier.details.title}</h2>
                <p className="text-gray-400 mt-1">{selectedTier.details.subtitle}</p>
              </div>
              <button onClick={() => setSelectedTier(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedTier.details.services.map((service, idx) => (
                <div key={idx} className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed pl-8">{service.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedTier(null)}
                className="flex-1 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setSelectedTier(null);
                  // 可以跳转到咨询页面或打开AI助手
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-medium transition-colors"
              >
                立即咨询
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-[#131d2b] border border-gray-700 rounded-2xl p-8 w-[700px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedItem.name}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-[#0b1120]/60 border border-gray-700/50 rounded-lg p-6">
              <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedItem.detail}
              </pre>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-medium transition-colors"
              >
                咨询了解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
