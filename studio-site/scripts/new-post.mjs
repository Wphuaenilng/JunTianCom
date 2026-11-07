#!/usr/bin/env node
/**
 * 新建博客文章草稿：
 *   npm run new:post -- "文章标题" [英文slug]
 * 文件：src/content/blog/<slug>.md，默认 draft: true（写完改成 false 才会发布）
 */
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const blogDir = join(scriptDir, "..", "src", "content", "blog");

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const title = (args[0] ?? "").trim();
if (title === "") {
  console.error('✗ 用法：npm run new:post -- "文章标题" [英文slug]');
  process.exit(1);
}

const fallbackSlug = `post-${todayInShanghai().replaceAll("-", "")}`;
const rawSlug = (args[1] ?? "").trim();
const slug =
  rawSlug !== ""
    ? rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : fallbackSlug;
if (slug === "") {
  console.error("✗ slug 清洗后为空，请换一个英文 slug");
  process.exit(1);
}

const file = join(blogDir, `${slug}.md`);
if (existsSync(file)) {
  console.error(`✗ ${slug}.md 已存在，直接编辑它即可：${file}`);
  process.exit(1);
}

const content = `---
title: ${title}
description: 一句话描述这篇文章解决什么问题（改我）
pubDate: ${todayInShanghai()}
category: 随笔
tags: []
draft: true
---

## 问题背景

谁在什么场景下会遇到什么问题？

## 我的方案

思路与取舍。

## 关键代码 / 步骤

\`\`\`ts
// 核心实现
\`\`\`

## 踩坑记录

- 

## 总结与改进方向

`;

writeFileSync(file, content);
console.log(`✓ 已创建草稿 ${file}`);
console.log("· draft: true 时不会出现在站点；写完后改成 false 即发布");
