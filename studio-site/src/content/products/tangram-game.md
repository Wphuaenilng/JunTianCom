---
name: 七巧板 · 小游戏
tagline: 经典七巧板益智游戏，50 个关卡，支持拖拽吸附与限时挑战。
cover: green
icon: gamepad-2
status: online
stack: ["Canvas", "H5", "PWA"]
metrics:
  - { icon: users, label: "6.1k 用户" }
  - { icon: heart, label: "好评 97%" }
links:
  site: "https://tangram.starisle.dev"
order: 3
---

## 它解决什么问题

给孩子（和自己）一个没有广告、没有内购、打开即玩的七巧板。50 个关卡从入门到烧脑。

## 核心功能

- 拖拽 + 磁性吸附，边缘对齐自动校准；
- 限时挑战与每日关卡；
- PWA 离线可玩，装进手机当 App 用。

## 技术要点

纯 Canvas 渲染，多边形碰撞用 SAT（分离轴定理）判定吸附；关卡数据是 JSON 描述的目标轮廓，理论上可以无限扩展。
