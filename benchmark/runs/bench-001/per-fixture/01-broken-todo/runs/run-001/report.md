# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/01-broken-todo/site/
# generated: 2026-05-25T11:17:35.988Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 9 experience observations across 4 agents · 35 events
- Predicted NPS: -19 (achievable: 79)
- Task success: 0% · Rage clicks: 6 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (86,627 in / 4,652 out)

## OBSERVATIONS

### [i01] HIGH · 可访问性 — 整个页面完全无法交互
SCALE: 1/4 agents felt this · 8 events · where: 在首页尝试点击 Inbox 按钮后页面完全没变化，之后又尝试了 Sprints、Reviews、Insights、导航栏的所有链接、Sign in 按钮以及 Request access 链接，全部没有任何反应。
QUOTE (Maya Chen, 产品经理): "我靠，这破页面什么鬼？点击任何东西都没反应。导航链接、按钮全部失效。这不是产品，这是展示废料。"

### [i03] HIGH · 功能契合 — 页面完全不可交互，没有任何反馈
SCALE: 1/4 agents felt this · 2 events · where: 在首页点击 Inbox 按钮尝试了解产品功能
QUOTE (李心怡, 运营专员): "点 Inbox 按钮一点反应都没有？连 URL 都没变化。这也太 broken 了吧。"

### [i04] HIGH · 信息架构 — 没有产品介绍，看不懂这是做什么的
SCALE: 1/4 agents felt this · 1 events · where: 在首页顶部导航栏附近寻找产品说明
QUOTE (李心怡, 运营专员): "页面也缺乏基本的产品介绍，我都不知道这是做什么的。"

### [i06] HIGH · 功能契合 — 落地页所有交互按钮全部失效
SCALE: 1/4 agents felt this · 7 events · where: 在产品落地页首页尝试点击功能按钮和登录入口
QUOTE (Kenji Okada, 开发工程师): "点了三次什么都发生——Sprints、Inbox、request access，全是死链接。这落地页是摆设吧？"

### [i07] HIGH · 流程顺畅 — 连 Sign in 都点不动，彻底关上了体验的门
SCALE: 1/4 agents felt this · 3 events · where: 尝试最后一个可能的入口 Sign in
QUOTE (Kenji Okada, 开发工程师): "连 Sign in 都是死的。整个产品落地页所有交互元素全部失效，一个都不工作。"

### [i08] HIGH · 功能契合 — 所有功能按钮都点不了，感觉这网站是死的
SCALE: 1/4 agents felt this · 5 events · where: 刚进入首页，尝试点击 Inbox、Sprints、Reviews、Pricing、request access 等多个按钮
QUOTE (王磊, 小企业主): "这什么破东西？所有的按钮都点不了，导航栏也没反应。这页面就是摆着看的，根本不是能用的产品。"

### [i09] HIGH · 情感氛围 — 产品看起来像能用的，但实际上是残次品
SCALE: 1/4 agents felt this · 5 events · where: 多次尝试交互失败后，对产品失去信任
QUOTE (王磊, 小企业主): "我小企业主，时间就是钱，花一分钟在这破网站上够了。"

### [i02] MED · 表达文案 — 产品定位模糊，标语缺乏信息量
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面时，除了看到标语和一些功能按钮，完全不知道这个产品是什么、解决什么问题、适合谁用。
QUOTE (Maya Chen, 产品经理): "Product页面？看起来是个项目管理工具，但名字没显示出来。'Ship products your customers will love'这标语挺大但没啥信息量。我需要看看这到底是啥。"

### [i05] MED · 视觉节奏 — 布局像是登录后界面但实际不是，用户容易困惑
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面时的第一印象
QUOTE (李心怡, 运营专员): "这个页面的布局有点奇怪...上面是导航栏，下面直接就是一堆按钮，看起来像是已经登录后的界面，不像是 landing page。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 导航菜单 | 25% (1/4) | 0% | -3.0 | 2 |
| Inbox功能 | 25% (1/4) | 0% | -3.0 | 1 |
| Sprints功能 | 25% (1/4) | 0% | -3.0 | 1 |
| Reviews功能 | 25% (1/4) | 0% | -3.0 | 1 |
| Pricing | 25% (1/4) | 0% | -3.0 | 1 |
| 申请访问 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (46s)
- 李心怡: frustrated (55s)
- Kenji Okada: frustrated (72s)
- 王磊: frustrated (72s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/01-broken-todo/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 1, Rage clicks ≤ 4.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
7 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/01-broken-todo/site/ --compare run-001` and stop if it regresses.
```