# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/02-dense-pricing/site/
# generated: 2026-05-25T11:18:36.517Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 28 events
- Predicted NPS: -6 (achievable: 92)
- Task success: 25% · Rage clicks: 2 · Delights: 1
- Sessions: 2 frustrated, 1 accomplished, 1 timeout
- Cost: $0.00 (140,807 in / 7,393 out)

## OBSERVATIONS

### [i01] HIGH · 性能感知 — 页面主内容区完全空白，滚动也没用
SCALE: 1/4 agents felt this · 3 events · where: 进入页面后滚动查看主体内容区
QUOTE (李心怡, 自由职业者): "我翻了好几次，页面好像就只显示导航栏和底部那几个按钮，看不到主要内容在哪里？是不是页面加载有问题？有点烦躁了。"

### [i02] HIGH · 流程顺畅 — 导航栏的 Pricing 链接点了没反应
SCALE: 1/4 agents felt this · 1 events · where: 尝试点击导航栏的 Pricing 链接
QUOTE (李心怡, 自由职业者): "点了导航也没反应，我就想看个价格信息而已。"

### [i03] HIGH · 情感氛围 — 作为一个急着比价的用户，一分钟什么都看不到已经没耐心了
SCALE: 1/4 agents felt this · 2 events · where: 等待页面加载 47 秒后放弃
QUOTE (李心怡, 自由职业者): "我操，这什么鬼？页面根本看不到任何内容，就一个导航栏和几个按钮，我翻了半天什么都没看到。我怀疑这是个坏掉的页面或者还在建设中。爷不伺候了。"

### [i06] HIGH · 信息架构 — 产品定位模糊，看不出是什么东西
SCALE: 1/4 agents felt this · 4 events · where: 打开页面后，我扫视了一圈，想快速找到“这是什么产品”的答案
QUOTE (Maya Chen, 产品经理): "看了半天也不知道这是个什么产品...页面上有几个卡片和按钮，但我看不清每个套餐的具体功能、价格和差异。"

### [i07] HIGH · 信息架构 — 定价信息几乎不可见，对比无从下手
SCALE: 1/4 agents felt this · 2 events · where: 我特意点击了'View pricing comparison'和'Detailed pricing page'，期望看到详细的套餐对比
QUOTE (Maya Chen, 产品经理): "我想知道具体功能和定价区别，但翻来覆去好像就这些东西，没看到详细的产品介绍或feature列表。"

### [i08] HIGH · 流程顺畅 — 点击按钮没有反应，交互完全失效
SCALE: 1/4 agents felt this · 4 events · where: 我在导航和卡片按钮上多次尝试点击，想进入下一步
QUOTE (Maya Chen, 产品经理): "点击了导航和按钮也没有反应，感觉这是个半成品或者是我的浏览器有问题。"

### [i09] HIGH · 流程顺畅 — 点「Start free」按钮完全没反应，感觉是半成品
SCALE: 1/4 agents felt this · 3 events · where: 在 Pricing 页面点击 Hobby 方案的 Start free 按钮，以及其他方案的 Start free 按钮
QUOTE (Kenji Okada, 运营经理): "点了好几个 Start free 按钮，页面完全没反应，感觉像是演示页面功能没接上。"

### [i04] MED · 信息架构 — 详细功能对比藏得不够浅，我差点以为没有
SCALE: 1/4 agents felt this · 1 events · where: 首页只看到三个套餐标题和价格，我在找具体包含什么功能时有点焦虑
QUOTE (Liam O'Connor, 技术总监): "终于看到详细的功能对比了——我以为就一个首页概览呢"

### [i10] MED · 信息架构 — 价格方案只有基本信息，看不出选哪个更值
SCALE: 1/4 agents felt this · 2 events · where: Pricing 页面浏览时
QUOTE (Kenji Okada, 运营经理): "我在这页面滚了好几圈了，似乎页面内容就是这些。我想要点击具体某个方案看看详细功能对比。"

### [i05] LOW · 信息架构 — Enterprise 一栏只写着"定制定价"，感觉像是放弃了说明
SCALE: 1/4 agents felt this · 1 events · where: 查看对比表格第三列
QUOTE (Liam O'Connor, 技术总监): "Starter 和 Pro 都有具体数字，Enterprise 突然就"无限"了？这个层级的客户更挑，为什么给的信息反而更少？"

## DELIGHTS
- **FAQ 直接解答了我最担心的计费方式问题** (1× · Liam O'Connor): "$79 是按 workspace 收，不是按人头——这句话比任何花哨文案都让我放心"
- **年付 8 折的折扣明确标注，不用猜** (1× · Liam O'Connor): "不像有些产品把折扣藏在角落里，或者需要联系销售才告诉你"
- **价格分层清晰，四个档位容易理解** (1× · Kenji Okada): "看到四个价格方案了：Hobby（免费）、Pro（$25）、Business（$49）、Enterprise（定制品）。感觉分层挺清晰的。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 滚动查看页面 | 25% (1/4) | 0% | -3.0 | 5 |
| 点击 Start free 开始试用 | 25% (1/4) | 0% | -3.0 | 3 |
| 查看定价对比 | 25% (1/4) | 0% | -3.0 | 2 |
| 点击导航链接 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看定价套餐 | 25% (1/4) | 100% | +1.0 | 1 |
| 查看功能对比表 | 25% (1/4) | 100% | +0.0 | 1 |
| 查看 FAQ | 25% (1/4) | 100% | +2.0 | 1 |
| 开始免费试用 | 25% (1/4) | 0% | -3.0 | 1 |
| 了解产品定位 | 25% (1/4) | 0% | -3.0 | 1 |
| 浏览价格方案 | 25% (1/4) | 100% | +1.0 | 1 |

## EXIT REASONS
- 李心怡: frustrated (65s)
- Liam O'Connor: accomplished (86s)
- Maya Chen: frustrated (104s)
- Kenji Okada: timeout (132s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/02-dense-pricing/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 14, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
7 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/02-dense-pricing/site/ --compare run-001` and stop if it regresses.
```