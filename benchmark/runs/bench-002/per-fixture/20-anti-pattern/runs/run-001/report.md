# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/20-anti-pattern/site/
# generated: 2026-05-26T03:01:11.204Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 39 events
- Predicted NPS: -9 (achievable: 100)
- Task success: 25% · Rage clicks: 5 · Delights: 0
- Sessions: 2 frustrated, 2 explored
- Cost: $0.00 (117,569 in / 6,012 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 导航栏形同虚设，点什么都没反应
SCALE: 1/4 agents felt this · 3 events · where: 进入页面后想找 Docs 看文档介绍，但点击顶部导航栏没有任何反应
QUOTE (Maya Chen, 全栈开发): "Docs、Product、Pricing 点了一遍一个都没跳出去，这是故意的还是坏了？"

### [i02] HIGH · 功能契合 — 演示区也是个摆设，戳不动
SCALE: 1/4 agents felt this · 2 events · where: 看到 CLI 演示区想试试效果，但按钮点不进去
QUOTE (Maya Chen, 全栈开发): "CLI 演示按钮点了两下也不动，既然是演示给我看的，为什么点不了？"

### [i03] HIGH · 信息架构 — 产品定位模糊，看完还是不知道能干啥
SCALE: 1/4 agents felt this · 1 events · where: 在无法点击任何链接的情况下，只能靠页面上零星文字猜测产品用途
QUOTE (Maya Chen, 全栈开发): "只知道是搞 incident management 的，但具体怎么用、解决什么问题，我还是懵的"

### [i04] HIGH · 功能契合 — 产品定位和访客预期完全错位
SCALE: 1/4 agents felt this · 1 events · where: 进入首页 / 查看内容
QUOTE (李心怡, 独立开发者): "来这里是找 Copilot 替代品的，但这看起来是监控/日志的 CLI 工具，不是我的菜。"

### [i05] HIGH · 流程顺畅 — Pricing 按钮点完没反应
SCALE: 1/4 agents felt this · 1 events · where: 点击 Pricing 按钮
QUOTE (李心怡, 独立开发者): "点了 Pricing 但页面好像没跳？URL 还是一样的。"

### [i06] HIGH · 可访问性 — 点击导航链接毫无反应
SCALE: 1/4 agents felt this · 2 events · where: 在页面顶部点击 Product / Docs / Pricing
QUOTE (王磊, 技术总监): "点了两下导航链接，页面纹丝不动。"

### [i07] HIGH · 流程顺畅 — 底部命令行按钮点完什么都没发生
SCALE: 1/4 agents felt this · 3 events · where: 点击底部的 plain status / plain incident open / plain logs --tail
QUOTE (王磊, 技术总监): "按钮点了完全没反应，这是展示用的demo吗？"

### [i09] HIGH · 信息架构 — 核心导航全部指向空白页面
SCALE: 1/4 agents felt this · 5 events · where: 点击 Pricing / Docs / Product 导航项
QUOTE (Kenji Okada, 后端工程师): "Pricing 点不动，Docs 也是空白……三个核心导航全挂了，这体验断得太突然。"

### [i08] MED · 情感氛围 — 页面名字叫 anti-pattern，看着像在展示反面教材
SCALE: 1/4 agents felt this · 1 events · where: 看到页面标题
QUOTE (王磊, 技术总监): "这个页面名字叫anti-pattern，不会是在展示反模式吧？"

### [i10] MED · 信息架构 — 页面信息密度极低
SCALE: 1/4 agents felt this · 1 events · where: 浏览首页整体布局
QUOTE (Kenji Okada, 后端工程师): "Learn more 指向哪也不说，页面内容太单薄，看不出这个产品到底解决什么问题。"

### [i11] MED · 流程顺畅 — 无法了解产品细节和定价
SCALE: 1/4 agents felt this · 3 events · where: 尝试从导航了解产品
QUOTE (Kenji Okada, 后端工程师): "定价策略看不到，产品介绍也看不到，注册前连基本的 value proposition 都获取不到。"

## DELIGHTS
- **界面颜值可以，排版挺舒服** (1× · Maya Chen): "虽然是个 demo 页，但视觉上没廉价感，看得出来有设计在里面的"
- **CLI 优先的理念挺戳我的** (1× · Maya Chen): "作为天天敲命令的人，CLI-first 这个定位我是有兴趣想了解的"
- **命令行按钮展示挺有极客感** (1× · 李心怡): "plain status, plain incident open 这些按钮看起来挺有意思，面向开发者的感觉。"
- **CLI 命令风格的 UI 很有吸引力** (1× · Kenji Okada): "plain status、plain incident open、plain logs --tail……这很对我命令行控的胃口。"
- **注册表单的弹窗 flow 是通的** (1× · Kenji Okada): "Start free 按钮点下去弹出了注册表单，Email + Workspace name，流程顺畅，没有断点。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 查看文档 | 25% (1/4) | 0% | -2.0 | 3 |
| 查看顶部导航 | 25% (1/4) | 0% | -3.0 | 3 |
| 使用命令行按钮 | 25% (1/4) | 0% | -3.0 | 3 |
| 导航到其他页面 | 25% (1/4) | 0% | -3.0 | 3 |
| 查看产品信息 | 25% (1/4) | 0% | -2.0 | 2 |
| 体验CLI演示 | 25% (1/4) | 0% | -2.0 | 1 |
| 查看首页内容 | 25% (1/4) | 0% | -2.0 | 1 |
| 点击 Pricing | 25% (1/4) | 0% | -3.0 | 1 |
| 浏览首页 | 25% (1/4) | 100% | -1.0 | 1 |
| 注册表单弹窗 | 25% (1/4) | 100% | +1.0 | 1 |
| 关闭弹窗 | 25% (1/4) | 100% | +0.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (45s)
- 李心怡: explored (51s)
- 王磊: frustrated (60s)
- Kenji Okada: explored (160s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/20-anti-pattern/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 11, Rage clicks ≤ 3.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
8 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/20-anti-pattern/site/ --compare run-001` and stop if it regresses.
```