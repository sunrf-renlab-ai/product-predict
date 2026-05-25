# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/04-empty-dashboard/site/
# generated: 2026-05-25T11:20:19.376Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 30 events
- Predicted NPS: -9 (achievable: 100)
- Task success: 0% · Rage clicks: 3 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (72,484 in / 5,178 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 空白仪表板没有任何内容或引导
SCALE: 1/4 agents felt this · 1 events · where: 刚进入 dashboard 页面
QUOTE (Kenji Okada, 项目经理): "这里什么都没有，我甚至不知道该从哪里开始。有点失望，感觉设计者没有考虑"用户的第一步"是什么。"

### [i02] HIGH · 性能感知 — Projects 点击后完全没反应
SCALE: 1/4 agents felt this · 1 events · where: 在空白 dashboard 点击导航
QUOTE (Kenji Okada, 项目经理): "点击了 Projects，页面完全没反应。URL 没变，内容没变。作为一个项目管理工具，这种交互反馈的缺失让我非常不安。"

### [i04] HIGH · 可访问性 — 导航链接点击后毫无反应
SCALE: 1/4 agents felt this · 2 events · where: 在左侧导航栏点击 Tasks
QUOTE (王磊, 技术负责人): "点了几次 Tasks，URL 都没变，内容也没变化，这是演示空壳还是链接根本没绑定？"

### [i05] HIGH · 情感氛围 — 空壳演示让人无法评估产品价值
SCALE: 1/4 agents felt this · 1 events · where: 进入首页后浏览全页
QUOTE (王磊, 技术负责人): "没有任何真实内容可供评估，继续待下去没有意义。纯粹浪费时间。"

### [i06] HIGH · 信息架构 — Dashboard 完全是空白，没有任何内容或引导
SCALE: 1/4 agents felt this · 1 events · where: 首次进入 Dashboard 首页
QUOTE (Maya Chen, 产品经理): "这让我不知道从哪开始，也不知道这个产品能干啥。没有欢迎信息、没有快捷入口、什么都没有。就左边有导航，但这导航点了还没反应。"

### [i07] HIGH · 可访问性 — 左侧导航栏点击后毫无响应，交互失效
SCALE: 1/4 agents felt this · 4 events · where: 在 Dashboard 页面试图通过左侧导航探索产品
QUOTE (Maya Chen, 产品经理): "点 Projects、Tasks、Help 一个个试过去，全部没有任何反应。我还以为是我的网络问题或者没加载完，但刷新了还是一样。"

### [i09] HIGH · 流程顺畅 — 点击导航完全没反应，探索之路直接断了
SCALE: 1/4 agents felt this · 2 events · where: 在仪表盘首页，左侧导航栏点击Projects、Tasks等
QUOTE (李心怡, 运营专员): "点了Projects但好像没反应？URL没变，页面也没变化。这个导航好像不太工作？"

### [i10] HIGH · 功能契合 — 空状态没有引导，不知道从哪里开始
SCALE: 1/4 agents felt this · 3 events · where: 翻看仪表盘页面，看到空的Recent Projects、My Tasks等卡片区域
QUOTE (李心怡, 运营专员): "这看起来像一个模板页面，导航点击不工作可能是因为这是展示空状态的页面……最多再等10秒看看有没有加载动画，没有就关掉。"

### [i03] MED · 与竞品对比 — 和 Asana 比起来完全没法上手
SCALE: 1/4 agents felt this · 1 events · where: 整体使用过程
QUOTE (Kenji Okada, 项目经理): "在 Asana 我可以立刻开始工作。这里我连第一步都迈不出去。"

### [i08] MED · 情感氛围 — 底部 Help/Docs 按钮也是死链接
SCALE: 1/4 agents felt this · 1 events · where: 在空 Dashboard 底部右下角尝试点击 Help
QUOTE (Maya Chen, 产品经理): "我连产品文档都看不到，连求助的渠道都没有。作为新用户，如果连帮助信息都没有，我会觉得这个产品要么还在很早期，要么就是不做用户支持，我不太敢把正事放在上面。"

## DELIGHTS
- **导航栏模块划分接近 Jira，风格熟悉** (1× · 王磊): "Projects、Tasks、Milestones、Sprints 这些模块名和 Jira 挺像，上手应该没门槛。"
- **界面框架看起来挺完整的，有点Trello的意思** (1× · 李心怡): "看到左侧有一排导航：Projects、Tasks、Milestones、Sprints……感觉像是Trello那种项目/任务管理工具。布局挺清晰的。 "

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 任务列表 | 25% (1/4) | 0% | -2.0 | 2 |
| 左侧导航 | 25% (1/4) | 0% | -3.0 | 2 |
| 导航至 Projects | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Kenji Okada: frustrated (48s)
- 王磊: frustrated (61s)
- Maya Chen: frustrated (62s)
- 李心怡: frustrated (78s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/04-empty-dashboard/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 11, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
8 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/04-empty-dashboard/site/ --compare run-001` and stop if it regresses.
```