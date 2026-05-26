# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/07-lost-search/site/
# generated: 2026-05-26T02:43:27.831Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 43 events
- Predicted NPS: -12 (achievable: 86)
- Task success: 0% · Rage clicks: 4 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (118,510 in / 5,007 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 搜索按回车完全没反应，感觉是假搜索框
SCALE: 1/4 agents felt this · 1 events · where: 在页面顶部的搜索框输入 'authentication' 并按 Enter 后
QUOTE (Maya Chen, 前端开发): "按了回车什么也没发生，搜索结果完全没有出来。这搜索功能是不是坏了？还是说需要等一下？感觉像是假搜索框。"

### [i04] HIGH · 功能契合 — 搜索框输入回车后页面没有任何响应，疑似功能挂掉
SCALE: 1/4 agents felt this · 1 events · where: 在首页搜索框输入 quickstart 按回车
QUOTE (Kenji Okada, 技术文档工程师): "搜索没反应，试试点击 Guides 导航看看内容"

### [i05] HIGH · 功能契合 — 导航栏所有链接点击后完全没变化，像是死链接
SCALE: 1/4 agents felt this · 4 events · where: 依次点击顶部导航 Docs/Guides/API/Community/Changelog
QUOTE (Kenji Okada, 技术文档工程师): "Guides也没反应，试试Docs"

### [i06] HIGH · 功能契合 — 过滤按钮 All/Guides/API/Account 点击无反应
SCALE: 1/4 agents felt this · 1 events · where: 点击过滤区域 All/Guides/API/Account 按钮
QUOTE (Kenji Okada, 技术文档工程师): "试试这个过滤按钮有没有用"

### [i07] HIGH · 功能契合 — 所有交互都像死机了一样，完全不可用
SCALE: 1/4 agents felt this · 3 events · where: 在搜索框输入 authentication 后按回车
QUOTE (Liam Zhao, 后端开发): "按了回车但什么都没发生？这搜索是实时的吗？"

### [i08] HIGH · 情感氛围 — 这页面像个壳子，点击全打水漂
SCALE: 1/4 agents felt this · 3 events · where: 依次尝试 Guides 分类过滤和顶部 Docs 导航
QUOTE (Liam Zhao, 后端开发): "整个搜索功能完全坏了吧？按钮点不动、导航也点不动，这页面是个壳？"

### [i10] HIGH · 功能契合 — 搜索功能完全失效，文档站点的命根子断了
SCALE: 1/4 agents felt this · 3 events · where: 在搜索框输入查询词后按回车
QUOTE (Maya Chen, 前端开发): "我输入了 authentication 按回车，什么都没发生，连个 loading 都没有，这不对劲啊？"

### [i02] MED · 性能感知 — 没有任何加载反馈，不知道是在等还是坏了
SCALE: 1/4 agents felt this · 1 events · where: 输入框输入内容后等待搜索结果出现的过程中
QUOTE (Maya Chen, 前端开发): "输入了内容但没有看到搜索结果出现...是在等回车吗？"

### [i03] MED · 流程顺畅 — 分类切换按钮没给实际内容，只是轻微变化
SCALE: 1/4 agents felt this · 1 events · where: 点击导航栏的 Guides 分类按钮后
QUOTE (Maya Chen, 前端开发): "点击了 Guides 按钮，页面底部多了一个 Privacy 链接，但搜索框还是原样，搜索结果在哪？这个搜索功能完全无响应啊。"

### [i09] MED · 流程顺畅 — 连我最基本的搜索意图都没机会验证
SCALE: 1/4 agents felt this · 1 events · where: 进入页面后立即进行搜索操作的完整路径
QUOTE (Liam Zhao, 后端开发): "我只是想搜个东西，看看有没有相关内容，就这么简单的事情都不行？"

### [i11] MED · 反馈感知 — 导航按钮点击后看不出页面有什么变化
SCALE: 1/4 agents felt this · 1 events · where: 点击顶部导航的 Guides 后
QUOTE (Maya Chen, 前端开发): "我点了 Guides，底下链接位置动了动，但我不知道到底切没切换成功，这让我很没底。"

## DELIGHTS
- **搜索框显眼，位置符合预期** (1× · Maya Chen): "搜索框挺显眼的。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 导航浏览 | 50% (2/4) | 0% | -3.0 | 7 |
| 搜索 | 50% (2/4) | 0% | -3.0 | 4 |
| 搜索文档 | 50% (2/4) | 0% | -3.0 | 3 |
| 内容过滤 | 25% (1/4) | 0% | -3.0 | 1 |
| 分类过滤 | 25% (1/4) | 0% | -3.0 | 1 |
| 浏览导航 | 25% (1/4) | 0% | -1.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (48s)
- Kenji Okada: frustrated (49s)
- Liam Zhao: frustrated (58s)
- Maya Chen: frustrated (66s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/07-lost-search/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 8, Rage clicks ≤ 2.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
7 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/07-lost-search/site/ --compare run-001` and stop if it regresses.
```