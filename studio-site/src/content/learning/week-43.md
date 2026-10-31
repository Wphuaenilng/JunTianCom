---
week: 43
date: 2026-10-26
title: 完成多 Agent 编排调研，测试 3 种框架
highlights:
  - "跑通 **CrewAI / AutoGen / 自研** 三套方案的基准测试，自研方案成本最低"
  - "文章《多 Agent 协作落地方案调研》发布，收到 12 条讨论"
  - "下周：把编排器接进 RAG 知识库，替换原来的单 Agent 链路"
links:
  - { slug: multi-agent-collaboration-survey, text: "多 Agent 协作落地方案调研" }
---

基准测试跑了 4 个晚上，结论比预期清晰：小团队场景下，显式 DAG 编排在成本和可观测性上都占优。
