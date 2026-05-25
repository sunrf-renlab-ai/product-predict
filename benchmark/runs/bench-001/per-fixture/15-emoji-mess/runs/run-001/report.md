# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/15-emoji-mess/site/
# generated: 2026-05-25T11:34:05.385Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 35 events
- Predicted NPS: -16 (achievable: 82)
- Task success: 0% · Rage clicks: 5 · Delights: 0
- Sessions: 3 frustrated, 1 timeout
- Cost: $0.00 (117,481 in / 5,594 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 导航栏所有链接点不动
SCALE: 1/4 agents felt this · 5 events · where: 刚进页面、想找入口了解产品
QUOTE (Kenji Okada, 产品设计师): "导航栏一个都不管用...这还怎么做产品评估？"

### [i02] HIGH · 信息架构 — 无法查看价格，预算评估阻断
SCALE: 1/4 agents felt this · 2 events · where: 25秒左右主动寻找价格信息
QUOTE (Kenji Okada, 产品设计师): "想知道价格，看看是否适合我的团队预算，点进去没反应"

### [i04] HIGH · 流程顺畅 — 导航链接全部失灵，根本不知道这产品是干嘛的
SCALE: 1/4 agents felt this · 4 events · where: 进入页面后想通过导航栏了解定价和产品信息
QUOTE (Alex Liu, 研发主管): "点了两次 Pricing 都没反应，这链接要么是死的，要么页面根本没实现路由跳转。这技术实现也太敷衍了。"

### [i05] HIGH · 信息架构 — 页面内容空洞，只有一个图片糊弄人
SCALE: 1/4 agents felt this · 2 events · where: 发现链接点不动后，在页面内浏览寻找有价值内容
QUOTE (Alex Liu, 研发主管): "所有导航链接都是摆设，就一个静态英雄区图片糊弄人，这种半成品页面谁会留下来？"

### [i06] HIGH · 功能契合 — 导航链接全部失灵，像个死站
SCALE: 1/4 agents felt this · 4 events · where: 首页导航栏 → 点击 Pricing → 点击 Docs → 点击主按钮
QUOTE (Maya Chen, 项目经理): "导航都坏了，点 Pricing 没反应，点 Docs 也没反应，这要么是个半成品，要么是个假站。"

### [i09] HIGH · 信息架构 — 页面内容太少，看不到产品价值
SCALE: 1/4 agents felt this · 3 events · where: 进入首页后试图通过滚动了解产品
QUOTE (李心怡, 运营专员): "就一张大图和几个导航链接，滚动无数次内容基本没变，完全不知道它是做什么的。"

### [i10] HIGH · 功能契合 — 导航链接点击没反应
SCALE: 1/4 agents felt this · 4 events · where: 尝试点击 Pricing / Main / Login / Docs 等导航项
QUOTE (李心怡, 运营专员): "点了主按钮、登录、文档，链接都点不动，这不是耍人吗？"

### [i03] MED · 情感氛围 — 基础交互缺失让产品显得不可信
SCALE: 1/4 agents felt this · 1 events · where: 多次尝试导航后
QUOTE (Kenji Okada, 产品设计师): "像个单页静态展示，连基本交互都没有"

### [i07] MED · 情感氛围 — 界面 emoji 过多，不像正经 PM 工具
SCALE: 1/4 agents felt this · 1 events · where: 首页首屏 → 导航栏
QUOTE (Maya Chen, 项目经理): "每个导航项前都塞 emoji，主按钮还带 🚀 和 🎉，太花哨了，像是需要"萌"属性的产品，不是给专业项目管理场景用的。"

### [i08] MED · 信息架构 — 静态 hero 区域，内容太少
SCALE: 1/4 agents felt this · 1 events · where: 首页首屏
QUOTE (Maya Chen, 项目经理): "页面就一个 hero 区域，什么实质性内容都没有，我想了解产品的核心价值根本无从下手。"

### [i11] MED · 流程顺畅 — 没有免费试用或安全感提示
SCALE: 1/4 agents felt this · 1 events · where: 进入页面后寻找定价或试用入口
QUOTE (李心怡, 运营专员): "我连它是干什么的都不知道，就别谈什么免费试用了。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 查看定价 | 75% (3/4) | 0% | -2.7 | 5 |
| 页面滚动 | 25% (1/4) | 0% | -2.0 | 10 |
| 导航点击 | 25% (1/4) | 0% | -3.0 | 4 |
| 浏览文档 | 25% (1/4) | 0% | -3.0 | 1 |
| 登录入口 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看文档 | 25% (1/4) | 0% | -2.0 | 1 |
| 登录/注册 | 25% (1/4) | 0% | -2.0 | 1 |
| 主 CTA 按钮 | 25% (1/4) | 0% | -2.0 | 1 |
| 浏览首页 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Kenji Okada: frustrated (80s)
- Alex Liu: frustrated (81s)
- Maya Chen: frustrated (95s)
- 李心怡: timeout (138s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/15-emoji-mess/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 4, Rage clicks ≤ 3.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
7 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/15-emoji-mess/site/ --compare run-001` and stop if it regresses.
```