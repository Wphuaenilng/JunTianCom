import type { APIRoute } from "astro";
import { fail, json, readJSON, writeJSON } from "../lib/store.js";

const FILE = "src/data/roadmap.json";
const COLORS = ["primary", "amber", "green"];

/** 结构校验，返回错误信息或 null */
function validate(data: unknown): string | null {
  const d = data as { roadmap?: unknown; reading?: unknown };
  if (!Array.isArray(d?.roadmap) || !Array.isArray(d?.reading)) {
    return "需要 roadmap[] 与 reading[]";
  }
  for (const item of d.roadmap) {
    const it = item as Record<string, unknown>;
    if (!String(it.title ?? "").trim()) return "roadmap 条目 title 必填";
    if (!COLORS.includes(String(it.color))) return `color 只能是 ${COLORS.join("/")}`;
    const p = Number(it.progress);
    if (!Number.isFinite(p) || p < 0 || p > 100) return "progress 需在 0-100";
    if (!Array.isArray(it.milestones)) return "milestones 需为数组";
    for (const m of it.milestones) {
      const mm = m as Record<string, unknown>;
      if (!String(mm.text ?? "").trim()) return "milestone text 必填";
    }
  }
  for (const item of d.reading) {
    const it = item as Record<string, unknown>;
    if (!String(it.title ?? "").trim()) return "reading 条目 title 必填";
  }
  return null;
}

export const GET: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  return json(readJSON(FILE));
};

export const PUT: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const error = body ? validate(body) : "请求体无效";
  if (error) return json({ error }, 400);
  writeJSON(FILE, body);
  return json({ ok: true });
};
