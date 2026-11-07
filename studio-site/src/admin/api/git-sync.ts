import type { APIRoute } from "astro";
import { execFileSync } from "node:child_process";
import { fail, json, REPO_ROOT } from "../lib/store.js";

export const POST: APIRoute = async ({ request }) => {
  const denied = fail(request);
  if (denied) return denied;

  const run = (args: string[]) =>
    execFileSync("git", args, { cwd: REPO_ROOT, timeout: 30000 }).toString().trim();

  try {
    run(["add", "studio-site/src/data", "studio-site/src/content"]);
    try {
      run(["commit", "-m", "admin: 数据与内容更新"]);
    } catch {
      return json({ ok: true, message: "没有待提交的变更" });
    }
    try {
      run(["push"]);
      return json({ ok: true, message: "已提交并推送到 GitHub" });
    } catch {
      return json({ ok: true, message: "已提交到本地；推送失败（网络原因），稍后手动 git push 即可" });
    }
  } catch (e) {
    return json({ ok: false, message: `git 出错：${e instanceof Error ? e.message : String(e)}` }, 500);
  }
};
