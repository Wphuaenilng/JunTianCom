import type { APIRoute } from "astro";
import { fail, json, readJSON, writeJSON } from "../lib/store.js";

const FILE = "src/data/site-settings.json";

/** 结构校验，返回错误信息或 null */
function validate(data: unknown): string | null {
  const d = data as {
    identity?: Record<string, unknown>;
    skills?: unknown;
    timeline?: unknown;
    coops?: unknown;
  };
  if (!d?.identity || typeof d.identity !== "object") return "缺少 identity";
  for (const key of ["name", "url", "title", "description", "author"]) {
    if (!String(d.identity[key] ?? "").trim()) return `identity.${key} 必填`;
  }
  if (!Array.isArray(d.skills) || !Array.isArray(d.timeline) || !Array.isArray(d.coops)) {
    return "skills/timeline/coops 需为数组";
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
