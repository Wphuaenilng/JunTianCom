#!/usr/bin/env node
/**
 * 解析 GitHub Issue「打卡」表单，写入 studio-site/src/data/checkins.json 并提交推送。
 * 由 .github/workflows/checkin.yml 调用；本机联调可加 --dry-run（只解析不写文件不提交）：
 *   ISSUE_BODY="$(cat body.txt)" node studio-site/scripts/parse-checkin.mjs --dry-run
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteDir = join(scriptDir, ".."); // studio-site/
const repoRoot = join(siteDir, ".."); // 仓库根
const dataFile = join(siteDir, "src", "data", "checkins.json");
const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  if (dryRun) {
    console.error(`[dry-run] 校验失败：${message}`);
  } else {
    writeFileSync(join(tmpdir(), "checkin-error.txt"), `⚠️ 打卡未能记录：${message}\n\n请点开 issue 编辑内容后重新提交（注意「今天学了什么」必须填写，日期格式为 YYYY-MM-DD 且不晚于今天）。`);
  }
  process.exit(1);
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

/** GitHub issue forms 的 body 是「### 标题\n\n值」的重复结构，空值为 _No response_ */
function parseFormSections(body) {
  const sections = {};
  const re = /^### (.+)$/gm;
  const heads = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    heads.push({ name: m[1].trim(), start: m.index, valueStart: m.index + m[0].length });
  }
  if (heads.length === 0) fail("表单内容为空");
  for (let i = 0; i < heads.length; i++) {
    const end = i + 1 < heads.length ? heads[i + 1].start : undefined;
    sections[heads[i].name] = body.slice(heads[i].valueStart, end).trim();
  }
  return sections;
}

const sections = parseFormSections(process.env.ISSUE_BODY ?? "");

const rawDate = (sections["日期"] ?? "").replace(/^_No response_$/, "").trim();
const date = rawDate === "" ? todayInShanghai() : rawDate;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00+08:00`))) {
  fail(`日期「${rawDate}」格式不对，应为 YYYY-MM-DD`);
}
if (date > todayInShanghai()) {
  fail(`日期「${date}」晚于今天`);
}

const topics = (sections["今天学了什么"] ?? "")
  .split(/\r?\n/)
  .map((line) => line.replace(/^[-*]\s+/, "").trim())
  .filter((line) => line !== "" && line !== "_No response_");
if (topics.length === 0) fail("「今天学了什么」为空");

const data = JSON.parse(readFileSync(dataFile, "utf8"));
data.checkins ??= [];
const existing = data.checkins.find((c) => c.date === date);
const merged = existing ? [...new Set([...existing.topics, ...topics])] : topics;
if (existing) existing.topics = merged;
else data.checkins.push({ date, topics });
data.checkins.sort((a, b) => a.date.localeCompare(b.date));

if (dryRun) {
  console.log(`[dry-run] date=${date}`);
  console.log(`[dry-run] topics=${merged.join("、")}`);
  console.log(existing ? "[dry-run] 合并到已有记录" : "[dry-run] 新增记录");
  process.exit(0);
}

const before = readFileSync(dataFile, "utf8");
writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`);
const unchanged = before === readFileSync(dataFile, "utf8");

const summary = `${date} · ${merged.join("、")}`;
if (unchanged) {
  writeFileSync(join(tmpdir(), "checkin-result.txt"), `✅ 该日打卡内容已在记录中，数据无变化：${summary}`);
} else {
  const git = (args) => execFileSync("git", args, { cwd: repoRoot });
  git(["config", "user.name", "github-actions[bot]"]);
  git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  git(["add", "studio-site/src/data/checkins.json"]);
  git(["commit", "-m", `checkin: ${summary}`]);
  git(["push"]);
  writeFileSync(join(tmpdir(), "checkin-result.txt"), `✅ 打卡已记录：${summary}\n\n热力图数据已更新，随下次部署展示到网站。`);
}
