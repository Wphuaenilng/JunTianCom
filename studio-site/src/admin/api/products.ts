import type { APIRoute } from "astro";
import {
  DIRS,
  cleanBody,
  deleteEntry,
  fail,
  json,
  linesToArray,
  listEntries,
  readEntry,
  safeSlug,
  writeEntry,
} from "../lib/store.js";

const STATUSES = ["online", "building", "beta"];

function productFrontmatter(body: Record<string, unknown>, prev?: Record<string, unknown>) {
  const status = String(body?.status ?? prev?.status ?? "building");
  if (!STATUSES.includes(status)) throw new Error(`status 只能是 ${STATUSES.join("/")}`);
  const links: { site?: string; repo?: string } = {};
  const site = String(body?.site ?? "").trim();
  const repo = String(body?.repo ?? "").trim();
  if (site) links.site = site;
  if (repo) links.repo = repo;
  return {
    ...(prev ?? {}),
    name: String(body?.name ?? "").trim(),
    tagline: String(body?.tagline ?? "").trim(),
    cover: String(body?.cover ?? "primary").trim() || "primary",
    icon: String(body?.icon ?? "box").trim() || "box",
    status,
    stack: linesToArray(body.stack),
    metrics: linesToArray(body.metrics).map((label) => ({ label })),
    ...(Object.keys(links).length ? { links } : {}),
    order: Number.isFinite(Number(body?.order)) ? Number(body.order) : 99,
  };
}

export const GET: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  return json(listEntries(DIRS.products));
};

export const POST: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const slug = safeSlug(String(body?.slug ?? ""));
  if (!slug) return json({ error: "slug 必填（字母/数字/中文、中横线）" }, 400);
  if (!String(body?.name ?? "").trim()) return json({ error: "name 必填" }, 400);
  if (readEntry(DIRS.products, slug)) return json({ error: `${slug} 已存在` }, 409);
  try {
    writeEntry(DIRS.products, slug, productFrontmatter(body), cleanBody(body?.body));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
  return json({ ok: true, slug });
};

export const PUT: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const originalSlug = safeSlug(String(body?.originalSlug ?? ""));
  const orig = originalSlug ? readEntry(DIRS.products, originalSlug) : null;
  if (!orig) return json({ error: "找不到原产品" }, 404);
  const slug = safeSlug(String(body?.slug ?? "") || originalSlug);
  if (!slug) return json({ error: "slug 非法" }, 400);
  if (slug !== originalSlug && readEntry(DIRS.products, slug)) {
    return json({ error: `${slug} 已存在` }, 409);
  }
  try {
    writeEntry(DIRS.products, slug, productFrontmatter(body, orig.data), cleanBody(body?.body));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
  if (slug !== originalSlug) deleteEntry(DIRS.products, originalSlug);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const slug = safeSlug(new URL(request.url).searchParams.get("slug") ?? "");
  if (!slug) return json({ error: "需要 ?slug=" }, 400);
  if (!deleteEntry(DIRS.products, slug)) return json({ error: `${slug} 不存在` }, 404);
  return json({ ok: true });
};
