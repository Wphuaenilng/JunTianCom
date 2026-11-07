/**
 * 年度学习路线 —— 数据在 roadmap.json（后台「路线进度」模块可编辑），
 * 本文件只负责类型与导出，站点页面照常从这里导入。
 */
import roadmapData from "./roadmap.json";

export type RoadmapColor = "primary" | "amber" | "green";

export interface Milestone {
  text: string;
  done: boolean;
}

export interface RoadmapItem {
  title: string;
  icon: string;
  color: RoadmapColor;
  progress: number; // 0 - 100
  milestones: Milestone[];
}

export interface ReadingItem {
  title: string;
  progress: string;
  icon: string;
  grad: string;
}

export const ROADMAP: RoadmapItem[] = roadmapData.roadmap as RoadmapItem[];

/** 正在读的书 */
export const READING: ReadingItem[] = roadmapData.reading as ReadingItem[];
