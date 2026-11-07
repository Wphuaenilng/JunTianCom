import type { APIRoute } from "astro";
import { fail, json, readJSON, writeJSON } from "../lib/store.js";

const FILE = "src/data/checkins.json";

interface CheckinEntry {
  date: string;
  topics: string[];
}
interface Checkins {
  checkins: CheckinEntry[];
}

function load(): Checkins {
  return readJSON<Checkins>(FILE);
}

function save(data: Checkins): void {
  data.checkins.sort((a, b) => a.date.localeCompare(b.date));
  writeJSON(FILE, data);
}

function validDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validTopics(t: unknown): t is string[] {
  return Array.isArray(t) && t.length > 0 && t.every((x) => typeof x === "string" && x.trim());
}

const clean = (t: string[]) => [...new Set(t.map((x) => x.trim()).filter(Boolean))];

export const GET: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  return json(load());
};

export const POST: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || !validDate(body.date) || !validTopics(body.topics)) {
    return json({ error: "需要 date（YYYY-MM-DD）和非空 topics[]" }, 400);
  }
  const data = load();
  const topics = clean(body.topics);
  const existing = data.checkins.find((c) => c.date === body.date);
  if (existing) existing.topics = [...new Set([...existing.topics, ...topics])];
  else data.checkins.push({ date: body.date, topics });
  save(data);
  return json({ ok: true });
};

export const PUT: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || !validDate(body.originalDate) || !validDate(body.date) || !validTopics(body.topics)) {
    return json({ error: "需要 originalDate、date（YYYY-MM-DD）和非空 topics[]" }, 400);
  }
  const data = load();
  const entry = data.checkins.find((c) => c.date === body.originalDate);
  if (!entry) return json({ error: `找不到 ${body.originalDate} 的记录` }, 404);
  entry.topics = clean(body.topics);
  entry.date = body.date;
  const dup = data.checkins.find((c) => c !== entry && c.date === body.date);
  if (dup) {
    dup.topics = [...new Set([...dup.topics, ...entry.topics])];
    data.checkins = data.checkins.filter((c) => c !== entry);
  }
  save(data);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!validDate(date)) return json({ error: "需要 ?date=YYYY-MM-DD" }, 400);
  const data = load();
  const before = data.checkins.length;
  data.checkins = data.checkins.filter((c) => c.date !== date);
  if (data.checkins.length === before) return json({ error: `找不到 ${date} 的记录` }, 404);
  save(data);
  return json({ ok: true });
};
