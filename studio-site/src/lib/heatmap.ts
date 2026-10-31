/**
 * 热力图数据（构建期生成，纯静态、零运行时 JS）
 * 移植自设计稿的确定性伪随机逻辑（mulberry32），演示用；
 * v1.1 计划改为从 Git 提交 / 周记 frontmatter 自动生成。
 */

export interface HeatDay {
  date: Date;
  count: number;
  /** 0-4，0 表示无记录 */
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 生成以 end 所在周（周一为首列）向前推 weeks 周的热力图格子。
 * 未来日期不产出格子（由列对齐决定）。
 */
export function buildHeatmap(
  seed = 42,
  weeks = 26,
  end: Date = new Date(),
): HeatDay[] {
  const rand = mulberry32(seed);
  const days: HeatDay[] = [];

  // 最后一列对齐到包含 end 的那一周的周一
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const offsetToMonday = (endDay.getDay() + 6) % 7; // 周一为 0
  const lastMonday = new Date(endDay);
  lastMonday.setDate(lastMonday.getDate() - offsetToMonday);

  const start = new Date(lastMonday);
  start.setDate(start.getDate() - (weeks - 1) * 7);

  const today = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > today) continue; // 未来日期留空

      const dow = d; // 周一=0 … 周日=6
      const r = rand();
      let count = 0;
      if (r > (dow >= 5 ? 0.5 : 0.25)) {
        count = 1 + Math.floor(rand() * 11);
      }
      const level: HeatDay["level"] =
        count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 8 ? 3 : 4;
      const label = `${date.getMonth() + 1}月${date.getDate()}日 · ${count} 次记录`;
      days.push({ date, count, level, label });
    }
  }
  return days;
}
