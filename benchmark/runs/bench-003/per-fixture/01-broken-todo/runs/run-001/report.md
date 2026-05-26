# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/01-broken-todo/site/
# generated: 2026-05-26T06:02:21.656Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 16 experience observations across 4 agents · 30 events
- Predicted NPS: -16 (achievable: 100)
- Task success: 0% · Rage clicks: 5 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (48,102 in / 4,090 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — Request Access 按钮点击无反应
SCALE: 1/4 agents felt this · 1 events · where: 在落地页顶部看到'Request Access'按钮，点击后期待弹出注册表单或跳转
QUOTE (Maya Chen, 产品运营): "点了'request access'但什么都没发生...链接是不是坏了？还是我理解错了？"

### [i02] HIGH · 流程顺畅 — Sign In 按钮点击无反应
SCALE: 1/4 agents felt this · 1 events · where: 点击右上角'Sign in'按钮，期待进入登录流程
QUOTE (Maya Chen, 产品运营): "想看看Sign in入口能不能进去，点击后没有任何反应"

### [i04] HIGH · 流程顺畅 — request access 按钮点击后无反应
SCALE: 1/4 agents felt this · 1 events · where: 在落地页顶部导航点击 request access 按钮
QUOTE (Kenji Okada, 前端开发): "点完'request access'毛反应没有，链接可能是坏的。"

### [i05] HIGH · 功能契合 — 侧边栏 Inbox/Sprints/Reviews/Insights 按钮全部无响应
SCALE: 1/4 agents felt this · 4 events · where: 点击左侧导航栏的各个功能按钮
QUOTE (Kenji Okada, 前端开发): "按钮点了没反应，连个加载状态都没有，直接就是死的。"

### [i06] HIGH · 流程顺畅 — Sign in 按钮点击后页面无任何变化
SCALE: 1/4 agents felt this · 2 events · where: 尝试通过 Sign in 按钮登录
QUOTE (Kenji Okada, 前端开发): "Sign in 按钮点不动，白点了两次。"

### [i09] HIGH · 功能契合 — 所有按钮点击无响应，页面是静态展示无法交互
SCALE: 1/4 agents felt this · 3 events · where: 在首页看到界面后，想点击导航项进入功能页面
QUOTE (李心怡, 行政主管): "点 Sign in 和 Inbox 都没反应，这页面完全是静态展示！所有按钮都是死的。作为用户我完全无法体验产品，登录不了也不知道能不能用，这种有壳没瓤的东西浪费时间。"

### [i10] HIGH · 流程顺畅 — 无法登录认证，完全阻断了使用流程
SCALE: 1/4 agents felt this · 1 events · where: 看到 Sign in 按钮想登录自己的账户
QUOTE (李心怡, 行政主管): "登录按钮点了完全没反应，我连账户都进不去。"

### [i11] HIGH · 功能契合 — 待办工具最核心的添加任务功能完全缺失
SCALE: 1/4 agents felt this · 1 events · where: 期待能找到添加新任务的地方来试用核心功能
QUOTE (李心怡, 行政主管): "作为一个待办工具我连最基本的添加任务都做不到，只能看一个静态页面。"

### [i12] HIGH · 信息架构 — Inbox 入口点击无反应，无法进入功能页面
SCALE: 1/4 agents felt this · 2 events · where: 绕过登录尝试直接进入功能页面
QUOTE (李心怡, 行政主管): "想看看能不能直接进入功能页面，结果 Inbox 也点不动。"

### [i13] HIGH · 功能契合 — 底部功能入口（Inbox/Sprints/Reviews/Insights）点击无响应
SCALE: 1/4 agents felt this · 1 events · where: 在首页底部点击 Inbox、Sprints、Reviews、Insights 按钮
QUOTE (王磊, 项目经理): "这什么破产品...点了Inbox按钮根本没用，URL都没变。作为项目管理工具，主要功能按钮都是摆设？Trello好歹点一下能跳转。这连基本可用性都没有，还谈什么项目管理。"

### [i14] HIGH · 信息架构 — 顶部导航链接（Product/Changelog等）点击无效
SCALE: 1/4 agents felt this · 1 events · where: 在首页顶部点击 Product、Changelog、Documentation 等导航链接
QUOTE (王磊, 项目经理): "彻底死心了。连顶部导航链接都是摆设。整页面的交互全部失效，这产品连基本的网站可用性都不达标。"

### [i16] HIGH · 功能缺失 — 无法添加任务——核心功能入口缺失
SCALE: 1/4 agents felt this · 1 events · where: 进入首页后寻找添加任务的入口
QUOTE (王磊, 项目经理): "作为PM我连一个todo都加不进去，所有按钮点完URL纹丝不动。这要是拿来管项目，黄花菜都凉了。"

### [i03] MED · 信息架构 — 缺少「演示环境」的提示文案
SCALE: 1/4 agents felt this · 1 events · where: 点了几个按钮都没反应，发现URL后才意识到这是故意损坏的demo
QUOTE (Maya Chen, 产品运营): "URL里写着'broken-todo'，所以这是故意坏着的演示啊...点什么都没反应"

### [i07] MED · 性能感知 — 点击 Inbox 时控制台报错 expected number, got undefined
SCALE: 1/4 agents felt this · 1 events · where: 在 Inbox 按钮上点击
QUOTE (Kenji Okada, 前端开发): "expected number, got undefined，这是代码有 bug 吧。"

### [i08] MED · 信息架构 — 页面 URL 自始至终没有变化，无法判断是否真的发生了跳转
SCALE: 1/4 agents felt this · 1 events · where: 多次点击各种按钮后观察地址栏
QUOTE (Kenji Okada, 前端开发): "URL 都没变过，感觉所有点击都是前端假装的，根本没有真正导航。"

### [i15] MED · 视觉节奏 — 页面中间主区域空旷且点击无反应
SCALE: 1/4 agents felt this · 1 events · where: 在首页中部尝试点击交互
QUOTE (王磊, 项目经理): "这页面感觉太空了，中间那块区域点击没反应，不知道是不是背景图。"

## DELIGHTS
- **落地页视觉风格干净整洁** (1× · Maya Chen): "风格挺干净的，有点像SaaS产品的典型布局"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 浏览工作区功能列表 | 25% (1/4) | 0% | -3.0 | 4 |
| 底部功能导航 | 25% (1/4) | 0% | -3.0 | 4 |
| 顶部导航链接 | 25% (1/4) | 0% | -3.0 | 3 |
| 登录账户 | 25% (1/4) | 0% | -3.0 | 2 |
| 申请访问 | 25% (1/4) | 0% | -2.0 | 1 |
| 登录 | 25% (1/4) | 0% | -2.0 | 1 |
| 申请访问权限 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看首页布局 | 25% (1/4) | 0% | -2.0 | 1 |
| 添加任务 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (45s)
- Kenji Okada: frustrated (56s)
- 李心怡: frustrated (63s)
- 王磊: frustrated (110s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/01-broken-todo/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 4, Rage clicks ≤ 3.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
12 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/01-broken-todo/site/ --compare run-001` and stop if it regresses.
```