---
title: 学习周记 · 第 40 周：给官网加了一块热力图
description: 本周把 GitHub 风格的学习热力图搬进了官网首页，顺手复习了 CSS Grid 的冷门用法。
pubDate: 2026-09-21
category: 学习周记
tags: ["随笔"]
cover: green
icon: pen-line
---

## 本周做了什么

- 给官网首页加了学习热力图，视觉上对齐 GitHub contributions；
- 数据先用确定性伪随机生成（mulberry32），后续接 Git 提交记录自动化；
- 复习了 CSS Grid 的 `grid-auto-flow: column`——热力图按列排布的关键。

## 一个小坑

热力图要"列 = 周、行 = 星期"，但数据是按天顺序生成的。直接 `grid-auto-flow: column` + 7 行可以解决，前提是**起始日期必须对齐到周一**，否则每一列都会错位。

## 下周计划

- 把周记从手写 Markdown 挪到独立集合，学习记录页自动渲染时间线；
- 继续 Rust 所有权章节。
