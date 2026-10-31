---
title: 把 RAG 检索准确率从 62% 提到 89%：我的 7 个实践
description: 分块策略、混合检索、重排序、引用校验——每个优化点都附前后对比数据与代码。
pubDate: 2026-10-18
category: AI 应用
tags: ["RAG", "LLM", "pgvector"]
cover: cyan
icon: database
---

RAG 的准确率是"木桶"：分块、检索、重排、生成，任何一块短板都会拖垮最终效果。这篇记录我把个人知识库问答的检索准确率从 62% 提到 89% 的 7 个实践，每一步都附上评测数据。

## 先建评测集，再谈优化

用 60 个真实问题 + 标准出处做金标准，指标用 recall@5 和端到端答案正确率。**没有评测集的调优都是玄学。**

| 优化点 | recall@5 | 增量 |
| --- | --- | --- |
| 基线（固定 512 token 分块 + 向量检索） | 62% | — |
| + 按语义边界分块 | 70% | +8 |
| + BM25 混合检索 | 77% | +7 |
| + 查询改写 | 81% | +4 |
| + 重排序 | 87% | +6 |
| + 引用校验与回退 | 89% | +2 |

## 关键代码：混合检索

向量检索擅长语义、BM25 擅长专有名词，二者取长补短：

```sql
-- pgvector + tsvector 混合检索，RRF 融合两路结果
WITH semantic AS (
  SELECT id, row_number() OVER (ORDER BY embedding <=> $1) AS rank
  FROM chunks WHERE project_id = $2 LIMIT 20
),
keyword AS (
  SELECT id, row_number() OVER (ORDER BY ts_rank(tsv, query) DESC) AS rank
  FROM chunks, websearch_to_tsquery('simple', $3) query
  WHERE project_id = $2 AND tsv @@ query LIMIT 20
)
SELECT id, 1.0 / (60 + rank) AS score FROM semantic
UNION ALL
SELECT id, 1.0 / (60 + rank) AS score FROM keyword
ORDER BY score DESC LIMIT 10;
```

## 其余实践速记

1. **分块用语义边界**（标题 / 段落），别用固定长度硬切；
2. **每块带元数据**：来源、章节路径、日期，过滤与引用全靠它；
3. **查询改写**：把口语化问题改写成检索友好形式，长问题收益最大；
4. **重排序用 bge-reranker**，注意显存，不够就上 ONNX 量化版；
5. **引用校验**：答案里的每个论断必须能定位到检索片段，定位不到就回退为"未找到"；
6. **坏Case周报**：每周从线上日志捞 10 个失败案例补进评测集。

## 踩坑记录

重排模型 7B 版本在 4G 显存上直接 OOM，换 ONNX int8 量化版后延迟 45ms、精度几乎无损。

## 总结

RAG 调优是系统工程：先把评测建好，再按增量收益排优先级。下一步是把 Agent 编排接进来，做多轮追问。
