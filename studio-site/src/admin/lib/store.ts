/**
 * 后台文件读写层：JSON 与 Markdown(frontmatter) 内容的统一存取。
 * 仅 dev 使用；所有 API 先过 guard()（DEV + localhost 双重防护）。
 */
import matter from "gray-matter";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// lib → admin → src → studio-site
export const SITE_ROOT = resolve(here, "../../.."); // studio-site/
export const REPO_ROOT = resolve(SITE_ROOT, ".."); // 仓库根

export const DIRS = {
  blog: "src/content/blog",
  learning: "src/content/learning",
  products: "src/content/products",
} as const;

/** 双重防护：仅 dev 环境 + 仅 localhost 请求 */
export function guard(request: Request): boolean {
  if (!import.meta.env.DEV) return false;
  const host = request.headers.get("host") ?? "";
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function fail(request: Request): Response | null {
  return guard(request) ? null : json({ error: "仅限本机 dev 环境访问" }, 403);
}

/** slug/文件名防护：允许字母数字中文与点横线，禁止路径穿越 */
export function safeSlug(slug: string): string | null {
  if (typeof slug !== "string") return null;
  const s = slug.trim();
  if (!s || s.includes("..") || /[\\/]/.test(s)) return null;
  return /^[a-z0-9\u4e00-\u9fff][a-z0-9\u4e00-\u9fff._-]*$/i.test(s) ? s : null;
}

/** Date → "YYYY-MM-DD"，保证 frontmatter 序列化干净 */
function normalizeDates<T>(value: T): T {
  if (value instanceof Date) return value.toISOString().slice(0, 10) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => normalizeDates(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDates(v);
    return out as unknown as T;
  }
  return value;
}

export function readJSON<T = unknown>(rel: string): T {
  return JSON.parse(readFileSync(join(SITE_ROOT, rel), "utf8")) as T;
}

export function writeJSON(rel: string, data: unknown): void {
  writeFileSync(join(SITE_ROOT, rel), `${JSON.stringify(data, null, 2)}\n`);
}

export interface ContentEntry {
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

export function listEntries(relDir: string): ContentEntry[] {
  const dir = join(SITE_ROOT, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const parsed = matter(readFileSync(join(dir, f), "utf8"));
      return {
        slug: f.slice(0, -3),
        data: parsed.data as Record<string, unknown>,
        body: parsed.content.trim(),
      };
    });
}

export function readEntry(relDir: string, slug: string): ContentEntry | null {
  const s = safeSlug(slug);
  if (!s) return null;
  const file = join(SITE_ROOT, relDir, `${s}.md`);
  if (!existsSync(file)) return null;
  const parsed = matter(readFileSync(file, "utf8"));
  return {
    slug: s,
    data: parsed.data as Record<string, unknown>,
    body: parsed.content.trim(),
  };
}

export function writeEntry(
  relDir: string,
  slug: string,
  data: Record<string, unknown>,
  body: string,
): void {
  const s = safeSlug(slug);
  if (!s) throw new Error(`非法 slug：${slug}`);
  const file = join(SITE_ROOT, relDir, `${s}.md`);
  writeFileSync(file, matter.stringify(body.trim(), normalizeDates(data)));
}

export function deleteEntry(relDir: string, slug: string): boolean {
  const s = safeSlug(slug);
  if (!s) return false;
  const file = join(SITE_ROOT, relDir, `${s}.md`);
  if (!existsSync(file)) return false;
  unlinkSync(file);
  return true;
}

export function cleanBody(body: unknown): string {
  return typeof body === "string" ? body.replace(/\r\n/g, "\n").trim() : "";
}

/** "每行一项"的 textarea 输入 → 数组 */
export function linesToArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/\r?\n/).map((v) => v.trim()).filter(Boolean);
}

export function validDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
