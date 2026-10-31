---
week: 42
date: 2026-10-19
title: RAG 重排序上线，准确率 82% → 89%
highlights:
  - "接入 bge-reranker，配合查询改写，长问题收益最大"
  - "踩坑：重排模型显存不足，改用 ONNX 量化版解决"
  - "沉淀文章一篇，附完整评测脚本"
links:
  - { slug: rag-accuracy-62-to-89, text: "把 RAG 检索准确率从 62% 提到 89%" }
---

重排是整条链路里收益最大的单项优化，但也是延迟大头——ONNX int8 量化后 45ms，可以接受。
