---
title: 我用 Astro + AI 一晚上搭好了这个官网
description: 从设计稿到上线的完整复盘：为什么选 Astro 而不是 Next.js，目录结构怎么组织。
pubDate: 2026-10-12
category: 前端
tags: ["Astro", "TypeScript", "部署"]
cover: violet
icon: layout-template
---

这篇是这个官网自己的复盘：从设计稿定稿到可部署的代码，一个晚上。记录技术选型的理由和让 AI 写得更好的几个做法。

## 为什么是 Astro 而不是 Next.js

本站 95% 的页面是"读"，交互只在主题切换和移动端菜单：

- **默认零 JS**：纯静态 HTML，Lighthouse 四项轻松 95+；
- **Content Collections**：Markdown frontmatter 用 zod 校验，写错构建立刻报错；
- **岛屿架构**：真需要交互时再按需 hydrate，本站暂时用不上。

Next.js 是更好的"应用框架"，但对纯内容站是杀鸡用牛刀，首包体积和维护成本都不划算。

## 目录结构

```
src/
├─ content.config.ts        # 三个集合的 zod schema
├─ content/                 # blog / products / learning
├─ components/              # Header / Footer / 卡片 / 热力图
├─ layouts/                 # Base + Post
├─ pages/                   # 路由
├─ styles/                  # tokens.css + global.css
└─ data/                    # 站点配置、学习路线
```

设计原则：**品牌信息集中在 `data/site.ts` 一处**，换品牌全局替换；内容全部走 Markdown，仓库即后台。

## 让 AI 写得更对的三个做法

1. 先给设计稿和设计令牌，让它"照抄"而不是"发挥"；
2. 每次只给一个组件的上下文，别让它看到整个项目就开始自由发挥；
3. 让它先写 schema 和数据结构，页面代码放最后——结构对了，页面只是翻译。

## 踩坑记录

Astro 5 的 Content Layer API 和旧版 `src/pages/**/*.md` 路由规则不同，`entry.id` 已经是 slug，别再手动 `slugify`。

## 总结

一晚上的时间分配大概是：设计稿确认 2 小时、骨架 1 小时、组件与页面 4 小时、细节打磨 2 小时。工具只决定下限，清晰的结构才决定 AI 输出的上限。
