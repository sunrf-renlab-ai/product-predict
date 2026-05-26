# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/01-broken-todo/site/
# generated: 2026-05-26T02:35:37.814Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 8 experience observations across 4 agents · 24 events
- Predicted NPS: -3 (achievable: 95)
- Task success: 25% · Rage clicks: 2 · Delights: 0
- Sessions: 1 timeout, 1 frustrated, 2 explored
- Cost: $0.00 (54,650 in / 4,187 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 要申请才能用，我懒得等
SCALE: 1/4 agents felt this · 1 events · where: 首页看到request access链接
QUOTE (王磊, 项目经理): "request access？这还要申请？我只是随便看看，又不是非用不可，算了不折腾了。"

### [i03] HIGH · 功能契合 — 所有可点击元素都不work，完全无法体验产品
SCALE: 1/4 agents felt this · 4 events · where: 进入页面后想注册账号，点击 Sign in 无反应；想看看有没有测试账号可以登录，点击登录按钮还是无反应；尝试点击 Inbox 也没有任何反应
QUOTE (Maya Chen, 产品经理): "Sign in 点了没反应？这么基础的功能都不work？什么都不work… Sign in、Inbox、Sprints、Reviews、Insights、request access 全都点不动。这是个半成品吧？"

### [i04] HIGH · 流程顺畅 — 需要申请访问的产品却没有登录入口，本身就是矛盾的
SCALE: 1/4 agents felt this · 1 events · where: 页面显示 'Request Access' 的产品，却没有 Sign in 的有效入口
QUOTE (Maya Chen, 产品经理): "又是一个需要"申请访问"的产品… 先看看长什么样吧，反正现在也进不去。"

### [i05] HIGH · 流程顺畅 — Sign in点了没反应，只能request access
SCALE: 1/4 agents felt this · 1 events · where: 落地页看到产品介绍后，想点Sign in进去看看具体功能，结果点了没反应，发现只能request access
QUOTE (李心怡, 创业公司创始人): "我以为点了Sign in能进后台看看，结果点了没反应，只能request access，这不是要我排队等邀请码吗，太烦了"

### [i06] HIGH · 功能契合 — 连产品长什么样都不知道就被拦在门外
SCALE: 1/4 agents felt this · 2 events · where: 落地页看了Inbox、Sprints等模块介绍，想进一步了解产品细节，却发现无法访问
QUOTE (李心怡, 创业公司创始人): "我还没搞清楚这货能做什么，就直接要我等邀请码了。Trello至少让我能先看看再决定合不合适"

### [i07] HIGH · 情感氛围 — 落地页看了个寂寞，40秒就劝退了
SCALE: 1/4 agents felt this · 3 events · where: 在落地页浏览各个模块介绍，期待能看到产品实际运作或试用入口，结果只有request access选项
QUOTE (李心怡, 创业公司创始人): "落地页花哨得很，介绍什么Inbox Sprints Reviews Insights，但我连试都不让试，这种产品不值得我花时间研究"

### [i08] HIGH · 功能契合 — 想动手试试，结果全是静态展示
SCALE: 1/4 agents felt this · 4 events · where: 点击导航栏的 Inbox/Sprints/Reviews/Insights 按钮后，发现只是不同截图的切换，没有任何真实交互
QUOTE (Kenji Okada, 前端工程师): "作为一个爱折腾的工具党，我想要的是一个能亲手操作的 live demo，而不是幻灯片式的展示。"

### [i02] MED · 情感氛围 — 刚想探索就被强制结束了
SCALE: 1/4 agents felt this · 1 events · where: 滚动页面时突然timeout
QUOTE (王磊, 项目经理): "我都还没开始呢，怎么就没了？"

## DELIGHTS
- **落地页看起来挺专业的** (1× · 王磊): "至少页面的排版和配色看着挺正规，不是那种草台班子。"
- **Empty state 设计让新用户看到真实使用场景** (1× · Kenji Okada): "当前状态就是'没有 pending review'，然后鼓励你'Open the demo'看团队的实际数据。这种 empty state 设计挺聪明的。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 切换功能模块查看 | 25% (1/4) | 100% | -1.0 | 4 |
| 查看落地页 | 25% (1/4) | 100% | +0.0 | 1 |

## EXIT REASONS
- 王磊: timeout (27s)
- Maya Chen: frustrated (44s)
- 李心怡: explored (66s)
- Kenji Okada: explored (79s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/01-broken-todo/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 17, Rage clicks ≤ 0.

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