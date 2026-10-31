/** 标签 → URL slug：空格转连字符，保留中文（浏览器与静态托管均会正确编码） */
export function tagSlug(tag: string): string {
  return tag.trim().replace(/\s+/g, "-");
}
