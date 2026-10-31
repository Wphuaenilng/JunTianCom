/** 阅读时长估算：中文按字、英文按词，约 400 字/分钟 */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/```[\s\S]*?```/g, " ") // 代码块粗略剔除
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
  const words = (
    text.replace(/[\u4e00-\u9fff]/g, " ").match(/[a-zA-Z0-9_]+/g) ?? []
  ).length;
  return Math.max(1, Math.round((cjk + words) / 400));
}

/** 日期格式化：2026-10-26 */
export function formatDate(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** shadcn-vue / Vue Bits / Inspira UI 风格的类名合并工具 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
