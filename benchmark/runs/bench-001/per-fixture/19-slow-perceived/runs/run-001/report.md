# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/19-slow-perceived/site/
# generated: 2026-05-25T11:40:14.070Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 45 events
- Predicted NPS: -7 (achievable: 100)
- Task success: 0% · Rage clicks: 3 · Delights: 1
- Sessions: 2 frustrated, 1 timeout, 1 explored
- Cost: $0.00 (125,453 in / 6,620 out)

## OBSERVATIONS

### [i01] HIGH · 性能感知 — 搜索框输入后没有任何反馈，像是卡死了
SCALE: 1/4 agents felt this · 2 events · where: 在搜索框输入关键词后
QUOTE (李心怡, 销售运营): "输入了'Lattice'搜索，但是表格好像没什么变化。是不是要等一下才有反应？"

### [i02] HIGH · 流程顺畅 — 两个筛选下拉按钮点完没反应，不知道是坏了还是我操作不对
SCALE: 1/4 agents felt this · 2 events · where: 依次点击Plan和Status筛选按钮
QUOTE (李心怡, 销售运营): "点击了Plan按钮但是没反应，没看到下拉菜单弹出。等了半天，搜索也没反应，筛选按钮点了也没反应。"

### [i03] HIGH · 情感氛围 — 整体响应太慢，感觉像卡住了一样，让我很烦躁
SCALE: 1/4 agents felt this · 3 events · where: 等待所有操作后
QUOTE (李心怡, 销售运营): "这速度也太慢了吧，跟我平时用的Excel差远了，感觉卡死了。"

### [i04] HIGH · 功能契合 — 搜索输入后列表不更新
SCALE: 1/4 agents felt this · 1 events · where: 在客户列表页面输入"Acompany"并按回车后
QUOTE (Kenji Okada, 客户成功经理): "按了回车但列表没有任何变化，搜索好像没生效？可能是实时搜索但界面没更新？这有点奇怪。"

### [i05] HIGH · 性能感知 — 搜索输入后按回车完全没反应
SCALE: 1/4 agents felt this · 2 events · where: 在首页搜索框输入"Acme"后回车
QUOTE (David Zhang, 运营总监): "搜索完按了回车，页面一点变化都没有。客户列表呢？搜索结果呢？什么都没出来。"

### [i06] HIGH · 流程顺畅 — 所有交互按钮都没有任何响应
SCALE: 1/4 agents felt this · 3 events · where: 尝试Plan下拉筛选和Status筛选，以及F5刷新
QUOTE (David Zhang, 运营总监): "Plan没反应，再试Status筛选，页面完全没有反应。刷新了还是一样。"

### [i07] HIGH · 信息架构 — 看不到任何客户数据，心里没底
SCALE: 1/4 agents felt this · 1 events · where: 进入首页后扫视整体布局
QUOTE (David Zhang, 运营总监): "页面加载出来了，但我看不到明显的客户列表数据。作为运营总监，我最关心的是能不能快速找到客户数据。"

### [i08] HIGH · 视觉节奏 — 首屏只有大图，看不到任何实质功能
SCALE: 1/4 agents felt this · 2 events · where: 刚进入网站首页
QUOTE (Maya Chen, 产品运营): "页面上基本只有一个大图片和顶部几个按钮，看不到客户列表在哪里。"

### [i09] HIGH · 信息架构 — 搜索框和下拉按钮用途不明
SCALE: 1/4 agents felt this · 3 events · where: 点击搜索框、Plan、Status按钮
QUOTE (Maya Chen, 产品运营): "搜索框不知道搜什么，Plan/Status按钮也不知道干什么用的。"

### [i10] HIGH · 功能契合 — 产品定位不清晰，不知道它是做什么的
SCALE: 1/4 agents felt this · 2 events · where: 整体浏览首页
QUOTE (Maya Chen, 产品运营): "这个产品信息太少，感觉没什么实质内容。"

## DELIGHTS
- **表格布局看起来挺清楚的，列名一目了然** (1× · 李心怡): "页面上有一个客户列表表格，显示了Company、Contact、Phone、Plan、Status、Actions等列，看着挺整齐的。"
- **客户详情侧滑面板体验流畅** (1× · Kenji Okada): "点击后右侧滑出了客户详情面板！Acompany的信息全在这。展开动画感觉很流畅。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 搜索客户 | 75% (3/4) | 0% | -2.3 | 5 |
| Plan筛选 | 50% (2/4) | 0% | -2.5 | 2 |
| Status筛选 | 50% (2/4) | 0% | -2.5 | 2 |
| 查看客户详情 | 25% (1/4) | 100% | +2.0 | 1 |
| 客户列表浏览 | 25% (1/4) | 100% | +1.0 | 1 |
| 页面刷新 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- 李心怡: frustrated (105s)
- Kenji Okada: timeout (132s)
- David Zhang: frustrated (133s)
- Maya Chen: explored (199s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/19-slow-perceived/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 13, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
10 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/19-slow-perceived/site/ --compare run-001` and stop if it regresses.
```