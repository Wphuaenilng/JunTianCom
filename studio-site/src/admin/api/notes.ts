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
  validDate,
  writeEntry,
} from "../lib/store.js";

const weekSlug = (week: number) => `week-${week}`;

export const GET: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  return json(listEntries(DIRS.learning));
};

export const POST: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const week = Number(body?.week);
  if (!Number.isInteger(week) || week <= 0) return json({ error: "week 需要正整数" }, 400);
  if (!validDate(body?.date)) return json({ error: "date 需要 YYYY-MM-DD" }, 400);
  const title = String(body?.title ?? "").trim();
  if (!title) return json({ error: "title 必填" }, 400);
  if (readEntry(DIRS.learning, weekSlug(week))) {
    return json({ error: `week-${week} 已存在` }, 409);
  }
  writeEntry(
    DIRS.learning,
    weekSlug(week),
    { week, date: body.date, title, highlights: linesToArray(body.highlights), links: [] },
    cleanBody(body.body),
  );
  return json({ ok: true, slug: weekSlug(week) });
};

export const PUT: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const originalWeek = Number(body?.originalWeek);
  const orig = Number.isInteger(originalWeek) ? readEntry(DIRS.learning, weekSlug(originalWeek)) : null;
  if (!orig) return json({ error: "找不到原周记" }, 404);
  const week = Number(body?.week);
  if (!Number.isInteger(week) || week <= 0) return json({ error: "week 需要正整数" }, 400);
  if (!validDate(body?.date)) return json({ error: "date 需要 YYYY-MM-DD" }, 400);
  const title = String(body?.title ?? "").trim();
  if (!title) return json({ error: "title 必填" }, 400);
  // 保留 UI 不编辑的字段（如 links）
  writeEntry(
    DIRS.learning,
    weekSlug(week),
    { ...orig.data, week, date: body.date, title, highlights: linesToArray(body.highlights) },
    cleanBody(body.body),
  );
  if (weekSlug(week) !== weekSlug(originalWeek)) deleteEntry(DIRS.learning, weekSlug(originalWeek));
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const week = Number(new URL(request.url).searchParams.get("week"));
  if (!Number.isInteger(week) || week <= 0) return json({ error: "需要 ?week=" }, 400);
  if (!deleteEntry(DIRS.learning, weekSlug(week))) return json({ error: `week-${week} 不存在` }, 404);
  return json({ ok: true });
};
