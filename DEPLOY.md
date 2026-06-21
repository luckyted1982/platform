# 智源嘉创平台 — GitHub Pages 部署指南

由于 GitHub API 限制，无法通过 MCP 自动创建 `.github/workflows` 目录。请按以下步骤手动启用自动部署：

## 步骤 1：创建 GitHub Actions Workflow（必需）

1. 打开仓库页面：`https://github.com/luckyted1982/platform`
2. 点击 **"Add file" → "Create new file"**
3. 文件路径输入：`.github/workflows/deploy.yml`
4. 将以下内容粘贴进文件编辑框：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
          cache-dependency-path: app/pnpm-lock.yaml

      - name: Install dependencies
        run: |
          cd app
          pnpm install --frozen-lockfile

      - name: Build frontend
        run: |
          cd app
          pnpm exec vite build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: app/dist/public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. 点击 **"Commit changes..."** → 填写提交信息（如 `Add Pages deploy workflow`）→ 选择 **"Commit directly to the main branch"** → 点击 **"Commit changes"**

## 步骤 2：启用 GitHub Pages（必需）

1. 在仓库页面，点击顶部 **"Settings"** 标签
2. 左侧导航栏选择 **"Pages"**（在 Code and automation 下）
3. 在 **Build and deployment** 区域：
   - **Source**：选择 **"GitHub Actions"**
   - 不要选择 "Deploy from a branch"（那是旧方式）
4. 点击 **Save**（如显示）

## 步骤 3：触发首次部署

完成上述两步后，GitHub Actions 会自动触发一次部署。你也可以手动触发：

1. 点击仓库顶部 **"Actions"** 标签
2. 选择左侧 **"Deploy to GitHub Pages"**
3. 点击右侧 **"Run workflow"** → 选择分支 `main` → 点击 **"Run workflow"**

## 部署完成后访问地址

部署成功后，访问地址为：

```
https://luckyted1982.github.io/platform/
```

（可在 Settings → Pages 中查看具体 URL）

## ⚠️ 重要说明

本项目是 **全栈应用**（React 前端 + Hono 后端 + MySQL 数据库）：
- **GitHub Pages 只能托管静态前端页面**（`app/dist/public` 构建产物）
- 后端 API、数据库、AI 服务等功能在 GitHub Pages 上**无法运行**
- 如需完整功能（含 API 和数据库），需要额外部署后端服务，如：
  - Vercel / Netlify / Render / Railway 等托管 Hono 后端
  - PlanetScale / Neon / Railway 等托管 MySQL 数据库
  - 配置环境变量（`DATABASE_URL`、`DEEPSEEK_API_KEY` 等）

## 当前仓库状态

- ✅ 所有源代码已推送至 `main` 分支
- ✅ `pnpm-lock.yaml` 已推送（确保依赖一致）
- ✅ `README.md`、`vite.config.ts`、`.env.example` 等配置已就位
- ⏳ 待手动操作：创建 `.github/workflows/deploy.yml` + 启用 Pages

---

*由 Kimi 自动生成于部署配置阶段*
