# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/07-lost-search/site/
# generated: 2026-05-25T11:24:09.488Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 12 experience observations across 4 agents · 42 events
- Predicted NPS: -16 (achievable: 100)
- Task success: 0% · Rage clicks: 8 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (107,048 in / 5,080 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 搜索按回车完全没反应
SCALE: 1/4 agents felt this · 2 events · where: 在搜索框输入 installation 后按 Enter
QUOTE (李心怡, 前端开发): "搜索按了回车什么都没发生？没有下拉框、没有结果、连 loading 都没有？这搜索是坏的吧……"

### [i02] HIGH · 流程顺畅 — 导航链接点击后毫无响应
SCALE: 1/4 agents felt this · 2 events · where: 在顶部导航找 Guides 并点击
QUOTE (李心怡, 前端开发): "搜索坏了，改看文档结构。点击 Guides 看看有没有内容。点击任何导航都没反应，页面像是静态的。"

### [i04] HIGH · 功能契合 — 搜索框在C位却完全不可用
SCALE: 1/4 agents felt this · 2 events · where: 在首页搜索框输入 install 并按回车
QUOTE (Maya Chen, 产品经理): "搜索框放C位，结果按回车不动？有点失望。"

### [i05] HIGH · 流程顺畅 — 导航栏是装饰，点了没反应
SCALE: 1/4 agents felt this · 2 events · where: 点击导航栏 Docs 链接
QUOTE (Maya Chen, 产品经理): "点击了 Docs 但页面完全没变。这是个假页面吧？导航栏都是装饰？"

### [i06] HIGH · 信息架构 — 子路径直接 404
SCALE: 1/4 agents felt this · 1 events · where: 直接访问 /docs 路径
QUOTE (Maya Chen, 产品经理): "直接访问 Docs 子路径看看有没有真实内容 — 404 了。"

### [i07] HIGH · 功能契合 — 搜索按回车完全没反应，核心功能挂掉
SCALE: 1/4 agents felt this · 3 events · where: 在首页搜索框输入 install 后按回车
QUOTE (王磊, 运维工程师): "回车按完什么都没发生？搜索框里的字还在，但没有任何结果。这不对劲。"

### [i08] HIGH · 流程顺畅 — 导航栏点击完全没响应，页面像摆设
SCALE: 1/4 agents felt this · 2 events · where: 搜索失败后尝试点击顶部 Docs 导航
QUOTE (王磊, 运维工程师): "导航点不了，搜索也没反应。这整个站是摆设吧？"

### [i10] HIGH · 功能契合 — 搜索框输入后回车完全没反应，感觉是个摆设
SCALE: 1/4 agents felt this · 1 events · where: 我在首页看到搜索框，想搜索感兴趣的内容，输入后按回车查看结果
QUOTE (Kenji Okada, 内容运营): "输入了'getting started'按回车，页面完全没变化。没有搜索结果，没有下拉建议，什么都没有。这搜索功能到底是摆设还是我哪里操作错了？"

### [i11] HIGH · 功能契合 — 导航链接点击后页面没有任何变化，怀疑是假链接
SCALE: 1/4 agents felt this · 2 events · where: 我想通过导航找内容分类，点 Docs 和 Guides 看看有没有内容
QUOTE (Kenji Okada, 内容运营): "页面看起来没有任何变化。我点击了 Docs，向下滚动了，但似乎什么都没有发生。这是个假链接吗？"

### [i12] HIGH · 情感氛围 — 找不到任何实质内容，对这个网站失去信任
SCALE: 1/4 agents felt this · 1 events · where: 在首页，搜索不工作，导航也不工作，想找内容但完全找不到入口
QUOTE (Kenji Okada, 内容运营): "我已经点击了 Docs、滚动、点击 Guides，页面完全没有任何变化。作为真实用户，我早就关掉去别的网站了。"

### [i03] MED · 情感氛围 — 没有任何交互反馈让我不知所措
SCALE: 1/4 agents felt this · 1 events · where: 整体使用过程中的感受
QUOTE (李心怡, 前端开发): "作为开发者我肯定不会用这种连基础搜索都不工作的文档站"

### [i09] MED · 与竞品对比 — 跟 Algolia DocSearch 比差太多，没理由切换过来
SCALE: 1/4 agents felt this · 1 events · where: 整个会话过程中持续对比
QUOTE (王磊, 运维工程师): "跟 Algolia DocSearch 体验差太多，完全没法用。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 搜索 | 100% (4/4) | 0% | -3.0 | 6 |
| 导航浏览 | 50% (2/4) | 0% | -3.0 | 3 |
| 导航点击 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- 李心怡: frustrated (77s)
- Maya Chen: frustrated (87s)
- 王磊: frustrated (91s)
- Kenji Okada: frustrated (96s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/07-lost-search/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 4, Rage clicks ≤ 6.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
10 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/07-lost-search/site/ --compare run-001` and stop if it regresses.
```