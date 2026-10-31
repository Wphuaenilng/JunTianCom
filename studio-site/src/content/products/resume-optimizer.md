---
name: AI 简历优化器 & 周报生成器
tagline: 粘贴工作记录，AI 自动生成结构化周报；上传简历，获得逐条优化建议与量化改写。
cover: violet
icon: file-text
status: online
stack: ["Next.js", "LLM", "Vercel"]
metrics:
  - { icon: users, label: "3.4k 用户" }
  - { icon: trending-up, label: "月增 18%" }
links:
  site: "https://resume.starisle.dev"
related: resume-optimizer-5-lessons
order: 1
---

## 它解决什么问题

- **周报难写**：粘贴 git 提交与工作记录，10 秒生成结构化周报（本周进展 / 数据 / 下周计划）；
- **简历不会包装**：逐条给出优化建议，把"负责 XX 功能"改写成带数字结果的表述。

## 核心功能

- 结构化输出：周报 / 简历建议均按固定 schema 返回，保证稳定可用；
- 隐私优先：文本即用即删，不落库存；
- 一键导出 Markdown / Word。

## 技术要点

Next.js App Router + 流式输出；模型侧用结构化输出约束 + 质量二次校验；Vercel 全托管，零服务器运维。

## 复盘

上线 3 个月的复盘见文章《上线 3 个月，AI 简历优化器给我上的 5 课》。
