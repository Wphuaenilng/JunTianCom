#!/usr/bin/env node
/**
 * 本地打卡（不依赖 GitHub 网络）：
 *   npm run checkin -- "Rust 所有权" "Agent 编排"
 * 可选：--date=YYYY-MM-DD 记别的日子；--no-push 跳过推送；--dry-run 只预览不写入
 * 行为：合并写入 src/data/checkins.json → git commit（留在本地）→ 尝试 push（失败不影响记录）
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteDir = join(scriptDir, "..");
const repoRoot = join(siteDir, "..");
const dataFile = join(siteDir, "src", "data", "checkins.json");
const dryRun = process.argv.includes("--dry-run");
const noPush = process.argv.includes("--no-push");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const dateArg = (process.argv.find((a) => a.startsWith("--date=")) ?? "").slice(7);
const date = dateArg === "" ? todayInShanghai() : dateArg;

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00+08:00`))) {
  fail(`日期「${dateArg}」格式不对，应为 YYYY-MM-DD`);
}
if (date > todayInShanghai()) {
  fail(`日期「${date}」晚于今天`);
}

const topics = [...new Set(args.map((t) => t.trim()).filter(Boolean))];
if (topics.length === 0) {
  fail('用法：npm run checkin -- "主题1" "主题2"（至少一个主题）');
}

const data = JSON.parse(readFileSync(dataFile, "utf8"));
data.checkins ??= [];
const existing = data.checkins.find((c) => c.date === date);
const merged = existing ? [...new Set([...existing.topics, ...topics])] : topics;
if (existing) existing.topics = merged;
else data.checkins.push({ date, topics });
data.checkins.sort((a, b) => a.date.localeCompare(b.date));

const summary = `${date} · ${merged.join("、")}`;

if (dryRun) {
  console.log(`[dry-run] ${existing ? "合并到已有记录" : "新增记录"}：${summary}`);
  process.exit(0);
}

const before = readFileSync(dataFile, "utf8");
writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`);
if (before === readFileSync(dataFile, "utf8")) {
  console.log(`✓ 该日已包含这些主题，数据无变化：${summary}`);
  process.exit(0);
}

const git = (args2, opts = {}) => execFileSync("git", args2, { cwd: repoRoot, ...opts });
git(["add", "studio-site/src/data/checkins.json"]);
git(["commit", "-m", `checkin: ${summary}`]);
console.log(`✓ 已打卡并提交到本地：${summary}`);

if (noPush) {
  console.log("· 已按 --no-push 跳过推送");
} else {
  try {
    git(["push"], { timeout: 30000 });
    console.log("✓ 已同步到 GitHub");
  } catch {
    console.log("· 推送失败（网络原因），记录已安全保存在本地；网络可用后执行 git push 即可同步");
  }
}
