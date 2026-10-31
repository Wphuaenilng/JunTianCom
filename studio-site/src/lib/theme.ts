/** 产品/文章封面渐变与配色（与设计稿一致） */
export const GRADIENTS: Record<string, string> = {
  violet: "linear-gradient(135deg,#6d7cff,#8b5cf6)",
  cyan: "linear-gradient(135deg,#0891b2,#22d3ee)",
  green: "linear-gradient(135deg,#059669,#34d399)",
  amber: "linear-gradient(135deg,#d97706,#fbbf24)",
  purple: "linear-gradient(135deg,#9333ea,#c084fc)",
  slate: "linear-gradient(135deg,#475569,#64748b)",
  primary: "linear-gradient(135deg,#6d7cff,#38d9f5)",
};

export function gradientCss(key: string | undefined): string {
  return GRADIENTS[key ?? "primary"] ?? GRADIENTS.primary;
}

/** 产品状态徽章文案 */
export const STATUS_LABEL: Record<string, string> = {
  online: "已上线",
  building: "开发中",
  beta: "内测",
};

export const STATUS_CLASS: Record<string, string> = {
  online: "on",
  building: "dev",
  beta: "beta",
};
