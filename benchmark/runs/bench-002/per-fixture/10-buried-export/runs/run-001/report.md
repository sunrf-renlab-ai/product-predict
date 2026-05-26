# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/10-buried-export/site/
# generated: 2026-05-26T02:47:29.632Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 13 experience observations across 4 agents · 54 events
- Predicted NPS: -10 (achievable: 100)
- Task success: 0% · Rage clicks: 7 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (245,653 in / 8,393 out)

## OBSERVATIONS

### [i01] HIGH · 可访问性 — 整个页面几乎没任何可点击响应的元素
SCALE: 1/4 agents felt this · 8 events · where: 进入页面后依次尝试点击顶部导航、时间筛选、维度筛选、按钮等所有可交互元素
QUOTE (张伟明, 财务经理): "点了好几次导航栏都没反应，不知道是不是页面问题还是我操作方式不对。顶部这些按钮看起来是静态的，没有交互反馈。"

### [i02] HIGH · 功能契合 — 我是来看数据导出功能的，页面完全没让我摸到门
SCALE: 1/4 agents felt this · 3 events · where: 带着找数据导出/报表生成的目的进入页面，但没有任何路径能到达相关功能
QUOTE (张伟明, 财务经理): "作为财务经理，我关心的是数据能不能导出、报表能不能生成，这破页面啥都干不了，还看什么看。"

### [i04] HIGH · 可访问性 — 导航栏点击完全没反应，基本可用性都成问题
SCALE: 1/4 agents felt this · 5 events · where: 在Dashboard主界面尝试使用顶部导航栏切换模块
QUOTE (David Liu, 运营总监): "Dashboards/Reports/Alerts/Audiences/Settings全点了一遍，URL都没变。这产品连基本导航都有问题。"

### [i05] HIGH · 功能契合 — 导出功能找不到，一键导出需求完全没被满足
SCALE: 1/4 agents felt this · 1 events · where: 在Dashboard页面寻找导出入口，尝试点击Settings、各种图表都没找到
QUOTE (David Liu, 运营总监): "导出功能在哪？花了两分钟什么都找不到，我直接关掉算了。"

### [i06] HIGH · 与竞品对比 — 跟之前试的Looker一样让人烦躁
SCALE: 1/4 agents felt this · 2 events · where: 整个使用过程中与之前用过的Looker进行对比
QUOTE (David Liu, 运营总监): "这体验比Looker还差，Looker至少能点到页面。这个产品功能有但藏得让人烦躁。"

### [i07] HIGH · 功能契合 — 标题写着 export，结果翻遍页面找不到导出功能在哪
SCALE: 1/4 agents felt this · 4 events · where: 进入页面 → 找不到导出入口 → 怀疑产品是半成品
QUOTE (杨佳妮, 数据分析师): "标题写'buried-export'，暗示有导出功能，但我翻了整个页面都没找到。这不是骗人吗？"

### [i08] HIGH · 信息架构 — 导航栏大部分点击没反应，好像都是装饰性的
SCALE: 1/4 agents felt this · 5 events · where: 顶部导航Reports → 无响应 → 侧边导航试了几个 → 全部无响应 → 只发现Settings能用
QUOTE (杨佳妮, 数据分析师): "点了Reports、Date Range好几个地方都没反应，这种交互让我觉得这页面根本没做完。"

### [i09] HIGH · 功能契合 — 核心图表是个OSS图片链接，根本不是可交互的数据图表
SCALE: 1/4 agents felt this · 1 events · where: 页面底部看到一个图表区域 → 发现是图片链接 → 感觉被骗了
QUOTE (杨佳妮, 数据分析师): "我每天用Tableau做报表，这个'图表'就一张图片，连数据点都点不了，算什么数据平台？"

### [i11] HIGH · 视觉节奏 — 页面加载后核心内容区域完全空白
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面时
QUOTE (Maya Chen, 产品经理): "刷新也没反应...我已经花了一分钟在这个页面上，看到的全是顶部导航栏和一堆筛选器按钮，没有任何实质数据内容。作为一个数据分析平台，这种'空白'状态让我完全提不起兴趣。"

### [i12] HIGH · 功能契合 — 导航菜单点击后没有任何响应
SCALE: 1/4 agents felt this · 4 events · where: 尝试点击顶部导航栏的各个菜单项
QUOTE (Maya Chen, 产品经理): "我点了Reports、点了Dashboard、点了各种菜单，页面完全没有变化...这是坏掉了吗？"

### [i13] HIGH · 流程顺畅 — 时间范围和筛选器操作没有效果
SCALE: 1/4 agents felt this · 2 events · where: 尝试使用时间筛选器和细分市场筛选器
QUOTE (Maya Chen, 产品经理): "试了切换不同时间范围，下拉筛选器也点了，但页面完全没有变化。"

### [i03] MED · 流程顺畅 — Settings弹个空弹窗就结束了，没有任何实际配置内容
SCALE: 1/4 agents felt this · 1 events · where: Settings页面
QUOTE (张伟明, 财务经理): "关闭这个弹窗"

### [i10] MED · 流程顺畅 — 筛选器改了也不刷新图表，交互反馈缺失
SCALE: 1/4 agents felt this · 2 events · where: 点击日期范围 → 无变化 → 点击细分下拉框 → 无变化
QUOTE (杨佳妮, 数据分析师): "切换日期范围、选Web细分，点了都没任何反馈，不知道筛选器到底有没有生效。"

## DELIGHTS
- **Settings菜单是唯一有反馈的功能** (1× · 杨佳妮): "点了半天终于有一个地方有反应了，虽然看不清弹出面板里有什么，但至少说明这个产品还有一丝可控性。"
- **Settings面板可以正常打开** (1× · Maya Chen): "终于有变化了！Settings点完后出现了一个面板，里面应该有东西。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 使用导航栏 | 25% (1/4) | 0% | -3.0 | 5 |
| 导航菜单 | 25% (1/4) | 0% | -2.0 | 5 |
| 寻找导出功能 | 25% (1/4) | 0% | -3.0 | 3 |
| 导航Reports | 25% (1/4) | 0% | -3.0 | 2 |
| Settings弹窗 | 25% (1/4) | 100% | -1.0 | 2 |
| 日期范围切换 | 25% (1/4) | 0% | -2.0 | 1 |
| 细分下拉选择 | 25% (1/4) | 0% | -2.0 | 1 |
| 时间范围切换 | 25% (1/4) | 0% | -1.0 | 1 |
| 下拉筛选器 | 25% (1/4) | 0% | -1.0 | 1 |
| 刷新按钮 | 25% (1/4) | 0% | -2.0 | 1 |
| Settings面板 | 25% (1/4) | 100% | +0.0 | 1 |

## EXIT REASONS
- 张伟明: frustrated (78s)
- David Liu: frustrated (96s)
- 杨佳妮: frustrated (104s)
- Maya Chen: frustrated (107s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/10-buried-export/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 10, Rage clicks ≤ 5.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
11 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/10-buried-export/site/ --compare run-001` and stop if it regresses.
```