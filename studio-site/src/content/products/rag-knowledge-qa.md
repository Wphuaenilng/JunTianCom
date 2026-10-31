---
name: 个人知识库问答（RAG）
tagline: 把笔记、文档喂进去，用自然语言提问，答案带出处引用。支持本地部署与多 Agent 协作。
cover: cyan
icon: database
status: online
stack: ["RAG", "pgvector", "Docker"]
metrics:
  - { icon: users, label: "980 用户" }
  - { icon: star, label: "712" }
links:
  repo: "https://github.com/starisle/rag-knowledge-qa"
related: rag-accuracy-62-to-89
order: 2
---

## 它解决什么问题

个人笔记越积越多，找东西越来越难。把 Obsidian / Notion 导出的文档喂进去，用自然语言提问，答案**每一条论断都带出处引用**。

## 核心功能

- 混合检索：向量 + BM25 + 重排序，检索准确率 89%（详见复盘文章）；
- 引用校验：定位不到出处的论断直接回退为"未找到"，不编造；
- 一键本地部署：docker compose up 即起，数据不出本机。

## 技术要点

PostgreSQL + pgvector 存储与检索；语义分块；bge-reranker（ONNX 量化）重排；FastAPI 服务端。

## 复盘

调优全过程见《把 RAG 检索准确率从 62% 提到 89%：我的 7 个实践》。
