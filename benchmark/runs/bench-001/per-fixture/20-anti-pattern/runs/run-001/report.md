# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/20-anti-pattern/site/
# generated: 2026-05-25T11:41:25.948Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 28 events
- Predicted NPS: -19 (achievable: 65)
- Task success: 0% · Rage clicks: 4 · Delights: 0
- Sessions: 1 timeout, 3 frustrated
- Cost: $0.00 (70,603 in / 3,822 out)

## OBSERVATIONS

### [i01] HIGH · 性能感知 — 入口就失败了，用户没有第二次机会
SCALE: 1/4 agents felt this · 1 events · where: 进入 URL 后立即失败
QUOTE (林哲远, 后端工程师): "什么东西啊，连接都不通？我还以为本地能直接跑呢。"

### [i02] HIGH · 情感氛围 — 没有任何加载提示或错误信息，空白感很强
SCALE: 1/4 agents felt this · 1 events · where: 页面加载阶段
QUOTE (林哲远, 后端工程师): "连个报错都没有，直接一片空白，我不知道是浏览器的问题还是服务没启动。"

### [i03] HIGH · 信息架构 — 产品定位完全模糊，看不出是PM工具
SCALE: 1/4 agents felt this · 1 events · where: 刚进入 landing page 时
QUOTE (Michael Rodriguez, 技术总监): "标题写着'20个Web架构反模式'，这看起来像技术文档或博客，不是项目管理系统。我进来是想找Jira替代品的，但这页面跟我有什么关系？"

### [i04] HIGH · 视觉节奏 — 页面内容看不清楚，无法获取有效信息
SCALE: 1/4 agents felt this · 2 events · where: 在首页滚动浏览时
QUOTE (Michael Rodriguez, 技术总监): "滚动后看到的还是图片为主，内容不太清楚。这页面到底是讲什么的？产品还是博客？"

### [i06] HIGH · 可访问性 — 导航栏全部失灵，产品概貌都看不到
SCALE: 1/4 agents felt this · 5 events · where: 进入首页后，依次点击了 Product、Docs、导航栏里的链接、还有一个按钮
QUOTE (王思琪, DevOps 工程师): "导航栏三个链接全部不响应，Start free 按钮也点不动。就一张静态图？我 DevOps 天天跟 kubectl 和 Terraform 打交道，最烦这种"花瓶"产品页面 — 文档链接打不开我怎么评估？"

### [i09] HIGH · 功能契合 — 所有可点击元素都毫无反应，像打开了个死页面
SCALE: 1/4 agents felt this · 4 events · where: 在首页依次尝试 Product、Pricing、Docs 导航链接和 Start free 按钮
QUOTE (Yuki Tanaka, 全栈开发): "导航链接点什么都没反应，Product、Pricing、Docs、Start free 按钮——一个都不工作。这完全是个死页面。浪费我时间。"

### [i05] MED · 流程顺畅 — 导航链接点击后没有明显反馈
SCALE: 1/4 agents felt this · 1 events · where: 尝试点击导航链接想了解产品时
QUOTE (Michael Rodriguez, 技术总监): "导航里的Product、Docs、Pricing点击后没有明显变化，内容也看不清楚。我想了解这个产品的定位，结果找不到入口。"

### [i07] MED · 表达文案 — 产品定位模糊，"in Minutes" 让我本能怀疑
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面扫视 hero 区域
QUOTE (王思琪, DevOps 工程师): "又是 AI Agent 平台...最近这种 landing page 看太多了。"Build & Deploy AI Agents in Minutes" - 这个 "in Minutes" 我要打问号。作为天天和 kubectl、Terraform 打交道的人，我最烦这种模糊的承诺。"

### [i08] MED · 信息架构 — 找不到任何实质性信息，产品价值主张缺失
SCALE: 1/4 agents felt this · 3 events · where: 试图点击 Pricing/Docs 了解更多信息但全部失败
QUOTE (王思琪, DevOps 工程师): "产品是什么、怎么定价、文档在哪里 — 全部被"花瓶"设计挡住了。跟我熟悉的 kubectl/Terraform 比，这种页面让我根本不想继续探索。"

### [i10] MED · 信息架构 — 页面内容信息太少，看不出这个产品到底是做什么的
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面时
QUOTE (Yuki Tanaka, 全栈开发): "看不到截图内容，只能看到有 Start free 按钮。这让我觉得有点奇怪，正常应该能显示页面的。"

### [i11] LOW · 视觉节奏 — 从截图猜页面应该很大很壮观，但啥都点不了
SCALE: 1/4 agents felt this · 1 events · where: 试图理解页面布局时
QUOTE (Yuki Tanaka, 全栈开发): "页面似乎只显示了一张大图但无法交互。作为一个对效率工具感兴趣的用户，这种体验让我完全没有继续探索的欲望。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 点击导航链接 | 25% (1/4) | 0% | -3.0 | 5 |
| 导航体验 | 25% (1/4) | 0% | -3.0 | 3 |
| 访问产品主页 | 25% (1/4) | 0% | -2.0 | 1 |
| CTA 按钮点击 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- 林哲远: timeout (22s)
- Michael Rodriguez: frustrated (62s)
- 王思琪: frustrated (82s)
- Yuki Tanaka: frustrated (193s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/20-anti-pattern/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 1, Rage clicks ≤ 2.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
6 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/20-anti-pattern/site/ --compare run-001` and stop if it regresses.
```