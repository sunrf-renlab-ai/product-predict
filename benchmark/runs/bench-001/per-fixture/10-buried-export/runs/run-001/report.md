# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/10-buried-export/site/
# generated: 2026-05-25T11:27:21.934Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 38 events
- Predicted NPS: -10 (achievable: 100)
- Task success: 0% · Rage clicks: 3 · Delights: 0
- Sessions: 3 frustrated, 1 timeout
- Cost: $0.00 (101,468 in / 4,406 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 导航栏是死的，点击后没有任何响应
SCALE: 1/4 agents felt this · 3 events · where: 在页面顶部导航栏尝试点击 Dashboards / Reports / Alerts
QUOTE (Kenji Okada, 产品经理): "导航栏三个按钮点了个遍，全都没反应。就一个静态图片撑场面。这不是产品，是PPT草稿吧？浪费我时间。"

### [i02] HIGH · 信息架构 — 首屏没有给我任何有价值的内容可看
SCALE: 1/4 agents felt this · 1 events · where: 进入页面的第一印象
QUOTE (Kenji Okada, 产品经理): "就一个顶部导航栏？Dashboards/Reports/Alerts/Settings，下面全是空白或图片。这是什么 dashboard 工具？看起来像个空壳。"

### [i03] HIGH · 流程顺畅 — 导航链接点击后完全没反应
SCALE: 1/4 agents felt this · 3 events · where: 进入首页后尝试点击顶部导航栏各个板块
QUOTE (Kenji Okada, 产品经理): "点 Dashboards 没反应，点 Reports 还是没反应，这算什么？耍我呢？"

### [i04] HIGH · 功能契合 — 页面像个空壳，看不出能干什么
SCALE: 1/4 agents felt this · 1 events · where: 尝试完所有导航后发现页面内容几乎空白
QUOTE (Kenji Okada, 产品经理): "导航栏写的挺全，但点进去什么都没有。这东西到底是干嘛的，我的核心需求能在这解决吗？"

### [i05] HIGH · 性能感知 — 页面打开后下方一片空白，什么都没加载
SCALE: 1/4 agents felt this · 2 events · where: 刚进入localhost:8200/10-buried-export/site/
QUOTE (王磊, 运营经理): "这什么破产品？连基本的页面都加载不出来？"

### [i06] HIGH · 流程顺畅 — 点击导航链接完全没有反应
SCALE: 1/4 agents felt this · 3 events · where: 在顶部导航栏尝试点击Dashboards和Reports
QUOTE (王磊, 运营经理): "点击了Dashboards链接，但页面似乎没有变化。点击Reports也没反应。"

### [i07] HIGH · 可访问性 — 刷新后问题依旧，没有恢复机制
SCALE: 1/4 agents felt this · 2 events · where: 按F5刷新页面
QUOTE (王磊, 运营经理): "刷新了还是一样，页面还是只有顶部导航栏。"

### [i08] HIGH · 流程顺畅 — 导航点完没反应，我不知道发生了什么
SCALE: 1/4 agents felt this · 2 events · where: 点击顶部导航栏的 Dashboards 链接
QUOTE (李心怡, 营销专员): "Dashboards点了怎么什么都不出来，是坏了还是我操作不对？"

### [i09] MED · 视觉节奏 — 弹窗内容被截断，看不全设置选项
SCALE: 1/4 agents felt this · 1 events · where: 点击 Settings 打开模态框
QUOTE (李心怡, 营销专员): "弹窗是出来了，但下面看不清，强迫症看着难受"

### [i10] MED · 信息架构 — 页面主体内容太单薄，没有指引我往哪走
SCALE: 1/4 agents felt this · 1 events · where: 在首页尝试滚动探索内容
QUOTE (李心怡, 营销专员): "滚动来滚动去页面内容完全一样，我都不知道进来能干啥"

## DELIGHTS
- **模态框本身能弹出来，说明基本交互是活的** (1× · 李心怡): "哦！原来有弹窗，不是坏了"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 顶部导航 | 25% (1/4) | 0% | -2.0 | 4 |
| 导航栏 | 25% (1/4) | 0% | -3.0 | 3 |
| 导航切换 | 25% (1/4) | 0% | -3.0 | 3 |
| Settings弹窗 | 25% (1/4) | 100% | +0.0 | 2 |
| 页面刷新 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Kenji Okada: frustrated (58s)
- Kenji Okada: frustrated (85s)
- 王磊: frustrated (90s)
- 李心怡: timeout (101s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/10-buried-export/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 10, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
8 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/10-buried-export/site/ --compare run-001` and stop if it regresses.
```