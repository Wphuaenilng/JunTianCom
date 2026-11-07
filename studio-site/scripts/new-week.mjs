#!/usr/bin/env node
/**
 * 新建本周学习周记模板：
 *   npm run new:week
 * 可选：--date=YYYY-MM-DD（默认今天，取其所在 ISO 周）
 * 文件：src/content/learning/week-<周号>.md（date 取该周周一）
 */
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const learningDir = join(scriptDir, "..", "src", "content", "learning");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

const dateArg = (process.argv.find((a) => a.startsWith("--date=")) ?? "").slice(7);
const dateStr = dateArg === "" ? todayInShanghai() : dateArg;
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || Number.isNaN(Date.parse(`${dateStr}T00:00:00Z`))) {
  fail(`日期「${dateStr}」格式不对，应为 YYYY-MM-DD`);
}

// ISO 周号与该周周一
const utc = new Date(`${dateStr}T00:00:00Z`);
const dayNum = utc.getUTCDay() || 7;
const monday = new Date(utc);
monday.setUTCDate(utc.getUTCDate() + 1 - dayNum);
const thursday = new Date(monday);
thursday.setUTCDate(monday.getUTCDate() + 3);
const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
const mondayStr = monday.toISOString().slice(0, 10);

const file = join(learningDir, `week-${week}.md`);
if (existsSync(file)) {
  fail(`week-${week}.md 已存在，直接编辑它即可：${file}`);
}

const content = `---
week: ${week}
date: ${mondayStr}
title: 本周主题一句话（改我）
highlights:
  - "这周学到 / 跑通了什么（改我）"
  - "产出了什么：文章 / 代码 / 决策（改我）"
---

随手记，十分钟以内：

- 
`;

writeFileSync(file, content);
console.log(`✓ 已创建 ${file}`);
console.log("· 填好 title 和 highlights 即会展示在学习记录页；链接博客文章用 links: [{ slug, text }]");
