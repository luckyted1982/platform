import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  chainLevel: varchar("chain_level", { length: 50 }),
  fundingStage: varchar("funding_stage", { length: 50 }),
  teamBackground: text("team_background"),
  coreTech: text("core_tech"),
  teamSize: int("team_size"),
  patents: int("patents"),
  trl: int("trl"),
  mrl: int("mrl"),
  tam: decimal("tam", { precision: 10, scale: 2 }),
  sam: decimal("sam", { precision: 10, scale: 2 }),
  som: decimal("som", { precision: 10, scale: 2 }),
  differentiation: text("differentiation"),
  competitors: text("competitors"),
  payingCustomers: text("paying_customers"),
  fundDirections: json("fund_directions"),
  instituteCapabilities: json("institute_capabilities"),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  rating: varchar("rating", { length: 10 }),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const researchReports = mysqlTable("research_reports", {
  id: serial("id").primaryKey(),
  projectId: int("project_id").notNull(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  query: text("query").notNull(),
  reportContent: text("report_content").notNull(),
  fourDimensions: json("four_dimensions").notNull(),
  sources: json("sources"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 智源嘉创平台 - 企业客户表
export const platformCompanies = mysqlTable("platform_companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  stage: varchar("stage", { length: 50 }),
  scale: varchar("scale", { length: 50 }),
  contact: varchar("contact", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 100 }),
  requirements: text("requirements"),
  status: varchar("status", { length: 20 }).notNull().default("potential"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 智源嘉创平台 - 服务订单表
export const serviceOrders = mysqlTable("service_orders", {
  id: serial("id").primaryKey(),
  companyId: int("company_id").notNull(),
  serviceModule: varchar("service_module", { length: 100 }).notNull(),
  serviceItem: varchar("service_item", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 智源嘉创平台 - 知识库表
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: json("tags"),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }),
  viewCount: int("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 智源嘉创平台 - 合作伙伴表
export const partners = mysqlTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  logo: varchar("logo", { length: 255 }),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  cooperationScope: text("cooperation_scope"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 智源嘉创平台 - AI助手对话记录
export const aiChatLogs = mysqlTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  intent: varchar("intent", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
