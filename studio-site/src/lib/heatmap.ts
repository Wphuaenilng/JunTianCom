/**
 * 热力图数据（构建期生成，纯静态、零运行时 JS）
 * 数据来自 src/data/checkins.json——由 GitHub Issue 打卡工作流自动写入，也可手工编辑纠错。
 */
import checkinsData from "../data/checkins.json";

export interface HeatDay {
  date: Date;
  count: number;
  /** 0-4，0 表示无记录 */
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
}

interface CheckinEntry {
  date: string; // YYYY-MM-DD
  topics: string[];
}

function levelOf(count: number): HeatDay["level"] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function labelOf(date: Date, topics: string[]): string {
  const md = `${date.getMonth() + 1}月${date.getDate()}日`;
  if (topics.length === 0) return `${md} · 未打卡`;
  const list = topics.join("、");
  return `${md} · ${list.length > 30 ? `${list.slice(0, 30)}…` : list}`;
}

/**
 * 生成以 end 所在周（周一为首列）向前推 weeks 周的热力图格子，
 * 每格深浅对应当天打卡的学习主题数量。未来日期不产出格子。
 */
export function buildHeatmap(weeks = 18, end: Date = new Date()): HeatDay[] {
  const byDate = new Map<string, string[]>();
  for (const c of (checkinsData as { checkins: CheckinEntry[] }).checkins) {
    byDate.set(c.date, c.topics ?? []);
  }

  const days: HeatDay[] = [];

  // 最后一列对齐到包含 end 的那一周的周一
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const offsetToMonday = (endDay.getDay() + 6) % 7; // 周一为 0
  const lastMonday = new Date(endDay);
  lastMonday.setDate(lastMonday.getDate() - offsetToMonday);

  const start = new Date(lastMonday);
  start.setDate(start.getDate() - (weeks - 1) * 7);

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > endDay) continue; // 未来日期留空

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const topics = byDate.get(key) ?? [];
      const count = topics.length;
      days.push({ date, count, level: levelOf(count), label: labelOf(date, topics) });
    }
  }
  return days;
}

/** 全部打卡记录（真实数据，构建期读取） */
export const ALL_CHECKINS: CheckinEntry[] = (
  checkinsData as { checkins: CheckinEntry[] }
).checkins;

function toDayNum(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86400000);
}

/** 截止最近一次打卡的连续学习天数（自然日连续，断一天即重新计） */
export function computeStreakDays(checkins: CheckinEntry[]): number {
  const days = [...new Set(checkins.map((c) => c.date))].sort().reverse();
  if (days.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (toDayNum(days[i - 1]) - toDayNum(days[i]) === 1) streak += 1;
    else break;
  }
  return streak;
}

/** 本周（周一至周日）打卡天数 */
export function computeWeekCount(
  checkins: CheckinEntry[],
  today: Date = new Date(),
): number {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const offsetToMonday = (end.getDay() + 6) % 7;
  const monday = Math.floor(
    Date.UTC(end.getFullYear(), end.getMonth(), end.getDate() - offsetToMonday) /
      86400000,
  );
  return checkins.filter((c) => {
    const n = toDayNum(c.date);
    return n >= monday && n <= monday + 6;
  }).length;
}

/** 首页学习动态所需的全部真实数字（构建期计算，无任何占位值） */
export function getLearningStats(today: Date = new Date()) {
  const sorted = [...ALL_CHECKINS].sort((a, b) => b.date.localeCompare(a.date));
  return {
    streakDays: computeStreakDays(ALL_CHECKINS),
    weekCount: computeWeekCount(ALL_CHECKINS, today),
    latestTopics: sorted[0]?.topics.slice(0, 3) ?? [],
  };
}
