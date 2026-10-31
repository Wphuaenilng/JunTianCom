---
name: 图书推荐引擎
tagline: 基于阅读口味标签的个性化书单推荐，附推荐理由解释。
cover: purple
icon: book-open
status: beta
stack: ["协同过滤", "Python"]
metrics:
  - { icon: star, label: "GitHub 486" }
links:
  repo: "https://github.com/starisle/book-recommender"
order: 5
---

## 它解决什么问题

"读过 A、B、C，接下来读什么？"——推荐结果不是黑盒：每本推荐都给出**为什么推荐**（基于哪些口味标签与相似读者）。

## 核心功能

- 口味标签建模：不是按书分类，而是按"阅读动机"打标；
- 协同过滤 + 冷启动用标签相似度兜底；
- 推荐理由可视化，可解释可干预。

## 当前状态

内测中：数据集与基线模型已开源，Web 端打磨中。
