# JunTianCom · 星屿工作室

个人工作室官网：对外名片 + 产品橱窗 + 学习日志。

- `studio-site/` — 官网源码（Astro 5 + Vue 岛屿 + Tailwind 4）
- `个人工作室官网-*.md` — 产品方案与实现计划
- `设计图-工作室官网.html` — 高保真设计稿

## 本地开发

```bash
cd studio-site
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 studio-site/dist

# 日常记录（详见下文「学习打卡」）
npm run checkin -- "Rust 所有权" "Agent 编排"   # 本地打卡,断网可用
npm run new:week                                # 生成本周周记模板
npm run new:post -- "文章标题" [slug]           # 生成博客草稿(draft:true)

# 可视化后台（仅 npm run dev 时存在）
# 浏览器打开 http://localhost:4321/admin
# 可管理:打卡记录 / 学习周记 / 博客文章 / 产品展示 / 路线进度 / 站点配置
```

## 站点后台（dev 专属）

`npm run dev` 后访问 **http://localhost:4321/admin**（仅本机可访问，`npm run build` 产物中不存在后台）。

- 覆盖：打卡记录、学习周记、博客文章、产品展示、学习路线进度、站点配置（品牌信息/关于页/合作方式）
- 后台保存后，开着官网的页面即时热更新
- 修改不会自动提交 git；在「仪表盘」点「提交并推送」一键 commit + push（离线时数据不丢，稍后手动 push）
- 实现位于 `src/admin/`（集成按 `command === "dev"` 注入路由，生产构建零暴露）

## 学习打卡（热力图数据来源）

两种打卡方式，数据都汇入 `studio-site/src/data/checkins.json`：

**方式一：本地命令（推荐，不依赖网络）**

```bash
npm run checkin -- "今天学的A" "今天学的B"
```

自动合并写入数据文件并 git commit 到本地；推送失败不影响记录，网络可用后 `git push` 一次同步。

**方式二：GitHub Issue（手机/异地）**

1. 进入本仓库 **Issues → New issue → 选「打卡」模板**（模板选择页若未出现，直接用标题「打卡」+ 正文每行一个主题也可）
2. 日期不填默认为今天（北京时间）
3. Action 自动写入数据并关闭 issue

说明：

- 首页的「连续学习 X 天」「本周打卡 ×N」等数字全部由数据文件构建期自动计算，无手工维护
- 同一天多次打卡自动合并主题；写错了直接编辑 `checkins.json`（日期格式 `YYYY-MM-DD`）
- 深浅规则：1 个主题 = 1 级，2 个 = 2 级，3~4 个 = 3 级，5 个及以上 = 4 级
