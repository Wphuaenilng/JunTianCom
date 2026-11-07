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
  validDate,
  writeEntry,
} from "../lib/store.js";

export const GET: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  return json(listEntries(DIRS.blog));
};

export const POST: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  if (!title) return json({ error: "title 必填" }, 400);
  if (!validDate(body?.pubDate)) return json({ error: "pubDate 需要 YYYY-MM-DD" }, 400);
  const fallback = `post-${String(body.pubDate).replaceAll("-", "")}`;
  const slug = safeSlug(String(body?.slug ?? "") || fallback);
  if (!slug) return json({ error: "slug 非法（字母/数字/中文、中横线）" }, 400);
  if (readEntry(DIRS.blog, slug)) return json({ error: `${slug} 已存在` }, 409);
  writeEntry(
    DIRS.blog,
    slug,
    {
      title,
      description: String(body?.description ?? "").trim(),
      pubDate: body.pubDate,
      category: String(body?.category ?? "随笔").trim() || "随笔",
      tags: linesToArray(body.tags),
      draft: Boolean(body?.draft),
      pinned: Boolean(body?.pinned),
    },
    cleanBody(body.body),
  );
  return json({ ok: true, slug });
};

export const PUT: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const originalSlug = safeSlug(String(body?.originalSlug ?? ""));
  const orig = originalSlug ? readEntry(DIRS.blog, originalSlug) : null;
  if (!orig) return json({ error: "找不到原文章" }, 404);
  const title = String(body?.title ?? "").trim();
  if (!title) return json({ error: "title 必填" }, 400);
  if (!validDate(body?.pubDate)) return json({ error: "pubDate 需要 YYYY-MM-DD" }, 400);
  const slug = safeSlug(String(body?.slug ?? "") || originalSlug);
  if (!slug) return json({ error: "slug 非法" }, 400);
  if (slug !== originalSlug && readEntry(DIRS.blog, slug)) {
    return json({ error: `${slug} 已存在` }, 409);
  }
  // 保留 UI 不编辑的字段（cover/icon/updateDate/related 等）
  writeEntry(
    DIRS.blog,
    slug,
    {
      ...orig.data,
      title,
      description: String(body?.description ?? "").trim(),
      pubDate: body.pubDate,
      category: String(body?.category ?? "随笔").trim() || "随笔",
      tags: linesToArray(body.tags),
      draft: Boolean(body?.draft),
      pinned: body?.pinned === undefined ? orig.data.pinned === true : Boolean(body.pinned),
    },
    cleanBody(body.body),
  );
  if (slug !== originalSlug) deleteEntry(DIRS.blog, originalSlug);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const slug = safeSlug(new URL(request.url).searchParams.get("slug") ?? "");
  if (!slug) return json({ error: "需要 ?slug=" }, 400);
  if (!deleteEntry(DIRS.blog, slug)) return json({ error: `${slug} 不存在` }, 404);
  return json({ ok: true });
};
