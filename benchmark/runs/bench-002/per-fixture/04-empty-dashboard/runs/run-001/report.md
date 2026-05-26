# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/04-empty-dashboard/site/
# generated: 2026-05-26T02:38:46.808Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 9 experience observations across 4 agents · 34 events
- Predicted NPS: -15 (achievable: 97)
- Task success: 0% · Rage clicks: 5 · Delights: 0
- Sessions: 1 timeout, 2 frustrated, 1 explored
- Cost: $0.00 (62,449 in / 4,121 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — session 超时机制打断了我这个潜在用户的探索节奏
SCALE: 1/4 agents felt this · 1 events · where: 进入页面后，我只做了一个观察 note，然后什么都没做就被强制退出了。
QUOTE (Maya Chen, 产品经理): "我只是看了一眼，还没试任何功能就被结束了，这让我觉得这个工具不欢迎我探索。"

### [i02] HIGH · 可访问性 — 空仪表盘没有任何可交互内容
SCALE: 1/4 agents felt this · 1 events · where: 进入空仪表盘页面后，点击左侧 Projects 链接
QUOTE (李心怡, 项目经理): "导航点了也没反应？这比ClickUp差远了，ClickUp至少能快速跳转到任务列表。这个空仪表盘让我完全不知道该干什么。"

### [i03] HIGH · 流程顺畅 — 缺少欢迎信息或快速上手引导
SCALE: 1/4 agents felt this · 1 events · where: 首次进入空仪表盘页面时尝试点击中间主区域
QUOTE (李心怡, 项目经理): "点击中间区域没反应...这是空仪表盘？Basecamp和ClickUp首次打开都有欢迎信息或快速上手引导，这个什么都没有。"

### [i04] HIGH · 与竞品对比 — Help链接也是静态的，彻底没辙了
SCALE: 1/4 agents felt this · 1 events · where: 尝试点击右下角 Help 链接
QUOTE (李心怡, 项目经理): "所有东西都点不动，这个"空仪表盘"就是个静态展示。21秒了，完全没有交互反馈。作为真实用户我早就关掉回ClickUp了。"

### [i05] HIGH · 功能契合 — 页面是静态展示，所有交互都死掉了
SCALE: 1/4 agents felt this · 5 events · where: 点击Projects导航 → 点击“+”按钮 → 尝试Quick Add区域
QUOTE (Kenji Okada, 前端开发): "这是静态的mockup？所有点击都没反应，我连想试试这个产品到底怎么样都做不到。"

### [i06] HIGH · 流程顺畅 — 作为一个想评估产品的用户，我只能看UI没法真正体验
SCALE: 1/4 agents felt this · 3 events · where: 进入empty dashboard后想创建第一个项目
QUOTE (Kenji Okada, 前端开发): "本来想体验创建项目、加任务这些核心功能，结果连第一步都迈不出去。演示环境应该让我能走完一个基础流程吧。"

### [i07] HIGH · 性能感知 — 侧边栏点完右边什么内容都没有
SCALE: 1/4 agents felt this · 7 events · where: 在左侧导航点击 Projects、Tasks 后，在右侧内容区等待观察
QUOTE (Emily Zhang, 运营专员): "每次截图看起来都是一样的，只有侧边栏在左边，中间空白什么都看不到。我不知道是没加载完还是这产品就这样设计的。"

### [i08] HIGH · 情感氛围 — 不知道空白是bug还是我的问题
SCALE: 1/4 agents felt this · 5 events · where: 多次点击导航和搜索框后截图对比，始终空白
QUOTE (Emily Zhang, 运营专员): "我都不知道自己在看什么，感觉自己在用半成品。"

### [i09] LOW · 信息架构 — 侧边栏项目太多有点被吓到
SCALE: 1/4 agents felt this · 1 events · where: 初进页面扫视左侧导航
QUOTE (Emily Zhang, 运营专员): "Projects, Tasks, Milestones, Sprints, Cycles, Goals, Reports, Team... 比 Asana 还多一个侧边栏。这么多选项我会不会找不到北？"

## DELIGHTS
- **Linear风格的设计确实好看，色彩和间距都舒服** (1× · Kenji Okada): "至少看起来不low，和Linear的调调很像。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 导航切换 | 25% (1/4) | 0% | -3.0 | 5 |
| 搜索 | 25% (1/4) | 0% | -2.0 | 3 |

## EXIT REASONS
- Maya Chen: timeout (25s)
- 李心怡: frustrated (36s)
- Kenji Okada: explored (47s)
- Emily Zhang: frustrated (63s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/04-empty-dashboard/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 5, Rage clicks ≤ 3.

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