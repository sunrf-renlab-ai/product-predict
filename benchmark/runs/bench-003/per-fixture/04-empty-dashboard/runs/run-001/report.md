# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/04-empty-dashboard/site/
# generated: 2026-05-26T06:05:28.084Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 16 experience observations across 4 agents · 29 events
- Predicted NPS: -14 (achievable: 100)
- Task success: 0% · Rage clicks: 3 · Delights: 0
- Sessions: 1 explored, 3 frustrated
- Cost: $0.00 (73,510 in / 4,834 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 左侧导航点击后页面和 URL 均无变化
SCALE: 1/4 agents felt this · 1 events · where: 在仪表板首页点击左侧导航 Projects 项
QUOTE (Kenji Okada, 前端开发者): "我点了 Projects 一下，结果什么都没发生，连 URL 都没变。这让我完全不清楚这个工具是否真的在运作。"

### [i02] HIGH · 信息架构 — 空状态页面缺少引导文案
SCALE: 1/4 agents felt this · 1 events · where: 在空仪表板上观察
QUOTE (Kenji Okada, 前端开发者): "页面上啥都没有，连个「创建你的第一个项目」之类的引导都没有，我根本不知道下一步该干嘛。"

### [i04] HIGH · 流程顺畅 — 点击导航栏Projects后页面无任何响应
SCALE: 1/4 agents felt this · 3 events · where: 在空仪表板首页点击左侧导航栏的Projects
QUOTE (Alex Wang, 小企业主): "我点击了Projects，但是页面好像完全没变化，内容区还是空的。是不是点错了位置？"

### [i05] HIGH · 功能契合 — 空状态页面没有任何引导用户下一步的操作
SCALE: 1/4 agents felt this · 1 events · where: 刚进入首页观察整个页面布局
QUOTE (Alex Wang, 小企业主): "这个空状态页面目前只有左侧导航，我还没看到主要内容区显示什么。进去之后该干嘛？"

### [i06] HIGH · 性能感知 — 等了40秒没有任何反馈，让我以为这是个假页面
SCALE: 1/4 agents felt this · 3 events · where: 点击Projects后等待页面响应
QUOTE (Alex Wang, 小企业主): "35秒了，页面还是一动不动。这到底是什么东西？一个假的设计稿吗？"

### [i08] HIGH · 功能契合 — 导航栏八个选项（Projects到Team）完全无法点击
SCALE: 1/4 agents felt this · 4 events · where: 尝试点击导航栏的各个项目
QUOTE (Alex Wang, 小企业主): "导航栏看起来像是静态设计稿而不是真实功能，连基本的点击都没反应。"

### [i09] HIGH · 功能契合 — 仪表盘全空白无引导，缺“创建第一个项目”提示
SCALE: 1/4 agents felt this · 2 events · where: 进入 localhost:8200/04-empty-dashboard/site/ 后查看整体仪表盘布局
QUOTE (Maya Chen, 产品经理): "空仪表盘，没有引导，没有创建第一个项目的提示，不知道空白是正常的还是加载失败"

### [i10] HIGH · 流程顺畅 — 导航点击后内容区无变化，缺加载/错误/空状态反馈
SCALE: 1/4 agents felt this · 3 events · where: 依次点击 Projects、Tasks 等多个导航项
QUOTE (Maya Chen, 产品经理): "点了好几个导航，都是空白，不知道是在加载还是坏了"

### [i11] HIGH · 功能契合 — 空壳模板无示例内容，无法理解产品用途
SCALE: 1/4 agents felt this · 2 events · where: 在仪表盘空白内容区浏览
QUOTE (Maya Chen, 产品经理): "这是空壳模板，没有任何内容引导，跟Notion比差太远"

### [i14] HIGH · 功能契合 — 所有交互元素均无反应，无法体验产品核心流程
SCALE: 1/4 agents felt this · 4 events · where: 在 Dashboard 主区域点击空白处、在 Projects 导航项上点击、尝试点击「+ New Project」按钮
QUOTE (李心怡, 设计师): "好家伙，连导航都是死的。点什么都没反应，这就是个静态页面吧？浪费时间。"

### [i15] HIGH · 功能契合 — 「+ New Project」按钮视觉上可点击，实际却无功能
SCALE: 1/4 agents felt this · 1 events · where: 看到中央引导区的「+ New Project」按钮后尝试点击
QUOTE (李心怡, 设计师): "想创建一个新项目试试，结果点完什么都没有。"

### [i03] MED · 视觉节奏 — 右侧预览区完全是空白，没有内容或说明
SCALE: 1/4 agents felt this · 1 events · where: 在空仪表板上观察右侧区域
QUOTE (Kenji Okada, 前端开发者): "右侧那一大块区域空得像没加载完一样，让我怀疑是不是网络出了问题。"

### [i07] MED · 信息架构 — 右侧只有Help和Docs入口，没有快速创建项目的按钮
SCALE: 1/4 agents felt this · 1 events · where: 观察首页顶部右侧功能区
QUOTE (Alex Wang, 小企业主): "顶部右边有Help和Docs，但作为一个新用户，我想先建个项目试试，它没给我这个入口。"

### [i12] MED · 与竞品对比 — 与竞品 Notion 相比缺少 widget/模板组件引导
SCALE: 1/4 agents felt this · 2 events · where: 与 Notion Dashboard 体验对比
QUOTE (Maya Chen, 产品经理): "Notion 至少会展示 widget 模板或者告诉你创建新的，这个什么都没有"

### [i16] MED · 可访问性 — 空状态缺少进度指示，无法判断是加载中还是真的没内容
SCALE: 1/4 agents felt this · 2 events · where: 点击 Dashboard 空白区域后等待几秒无响应
QUOTE (李心怡, 设计师): "点了一下没反应——是加载慢还是在骗我？"

### [i13] LOW · 信息架构 — 侧边导航项过多，缺视觉层级和分组
SCALE: 1/4 agents felt this · 1 events · where: 查看左侧导航列表
QUOTE (Maya Chen, 产品经理): "导航太多太杂，点开都是空的，找不到重点"

## DELIGHTS
- **左侧导航布局符合我对项目管理工具的认知** (1× · Kenji Okada): "Projects、Tasks、Milestones、Sprints 这些导航项看起来很熟悉，和 Jira 或 Trello 类似的结构让我有种亲切感。"
- **左侧导航栏布局清晰，看起来专业** (1× · Alex Wang): "左侧有导航栏，列了Projects、Tasks、Milestones、Sprints、Cycles、Goals、Reports、Team，看起来挺专业的。"
- **空状态引导文案清晰，一眼知道要干什么** (1× · 李心怡): "Pin a project, or create a new one to get started——这个提示很清楚，不迷路。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 切换导航项 | 25% (1/4) | 0% | -3.0 | 4 |
| 点击导航项目 | 25% (1/4) | 0% | -2.0 | 1 |
| 观察空仪表板布局 | 25% (1/4) | 100% | -1.0 | 1 |
| 点击Projects导航 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看仪表盘 | 25% (1/4) | 0% | -2.0 | 1 |

## EXIT REASONS
- Kenji Okada: explored (48s)
- Alex Wang: frustrated (81s)
- Maya Chen: frustrated (119s)
- 李心怡: frustrated (119s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/04-empty-dashboard/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 6, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
11 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/04-empty-dashboard/site/ --compare run-001` and stop if it regresses.
```