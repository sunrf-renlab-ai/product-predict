# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/20-anti-pattern/site/
# generated: 2026-05-26T06:33:00.858Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 19 experience observations across 4 agents · 48 events
- Predicted NPS: -9 (achievable: 100)
- Task success: 0% · Rage clicks: 5 · Delights: 0
- Sessions: 3 frustrated, 1 explored
- Cost: $0.00 (172,351 in / 7,117 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 导航链接全部无响应
SCALE: 1/4 agents felt this · 3 events · where: 在首页点击顶部导航栏的任何链接
QUOTE (Maya Chen, 全栈工程师): "Product/Docs/Pricing点了个寂寞"

### [i02] HIGH · 流程顺畅 — CLI风格按钮点击后无反应
SCALE: 1/4 agents felt this · 1 events · where: 点击plain status/plain incident open/plain logs --tail等按钮
QUOTE (Maya Chen, 全栈工程师): "点了plain status按钮，什么反应都没有"

### [i06] HIGH · 流程顺畅 — 所有按钮和链接均不可点击，无任何响应
SCALE: 1/4 agents felt this · 4 events · where: 在首页点击 plain status 按钮后
QUOTE (李心怡, 前端组长): "点了 plain status 按钮，页面看起来没变化。这三个按钮可能是展示区，不是交互的。"

### [i07] HIGH · 功能契合 — 所有 Learn more 链接不可跳转
SCALE: 1/4 agents felt this · 3 events · where: 在首页点击三个 Learn more 链接后
QUOTE (李心怡, 前端组长): "Learn more 链接也不跳转，整个页面像是个静态展示。"

### [i08] HIGH · 流程顺畅 — Start free 按钮无任何交互或跳转
SCALE: 1/4 agents felt this · 1 events · where: 在首页点击 Start free 按钮后
QUOTE (李心怡, 前端组长): "这个页面是个反模式展示——所有按钮和链接都是假的，完全不可交互。作为用户在这里完全是浪费时间。"

### [i11] HIGH · 功能契合 — 导航栏 Product/Docs/Pricing 三个链接全部无效
SCALE: 1/4 agents felt this · 3 events · where: 在页面顶部导航栏点击 Product、Docs、Pricing
QUOTE (Kenji Okada, 独立开发者): "导航栏三个链接全部点了一遍，URL 都是同一个，页面完全没有变化。这是在逗我？"

### [i12] HIGH · 功能契合 — 三个区块的 Learn more 链接点击后无响应
SCALE: 1/4 agents felt this · 1 events · where: 在 Features 区块点击第一个 Learn more
QUOTE (Kenji Okada, 独立开发者): "点了一个 Learn more 什么都没发生，页面还是原样。可能这些链接没实现，或者我网络/JS加载问题。"

### [i15] HIGH · 流程顺畅 — All CTA buttons are fake/captive - clicking does nothing
SCALE: 1/4 agents felt this · 4 events · where: Tried clicking 'plain logs --tail', 'plain status', incident open button, and main CTA button
QUOTE (Tyler Brooks, DevOps 工程师): "These buttons are fake - they're labeled like CLI commands ('plain status', 'plain logs --tail') but clicking does nothing. This is a static demo page."

### [i16] HIGH · 信息架构 — Navigation links don't work - no actual pages to visit
SCALE: 1/4 agents felt this · 3 events · where: Clicked Product link, Docs link, Pricing link - none navigated anywhere
QUOTE (Tyler Brooks, DevOps 工程师): "Nav links, buttons, CTA - all dead. This is a broken demo."

### [i17] HIGH · 功能契合 — Can't access pricing page to evaluate cost/plan options
SCALE: 1/4 agents felt this · 1 events · where: Wanted to check pricing tier to evaluate if I would switch from my current tools
QUOTE (Tyler Brooks, DevOps 工程师): "Without a working demo, I can't assess pricing, features, or UX."

### [i18] HIGH · 功能契合 — Status page interaction is fake - no real data or logs
SCALE: 1/4 agents felt this · 1 events · where: Expected to see actual incident management UI with logs, status changes - got nothing
QUOTE (Tyler Brooks, DevOps 工程师): "Check what kind of status page this is - relevant to my DevOps work. But the 'incident open' button does nothing."

### [i03] MED · 信息架构 — 首页无有价值内容，用户无法理解产品定位
SCALE: 1/4 agents felt this · 1 events · where: 初次进入首页
QUOTE (Maya Chen, 全栈工程师): "之前那些plain logs --tail按钮看起来像是CLI命令伪装成UI按钮，我作为普通用户第一眼完全不知道这站是干嘛的"

### [i04] MED · 功能契合 — 唯一"功能"仅是注册弹窗
SCALE: 1/4 agents felt this · 1 events · where: 点击后触发的注册弹窗
QUOTE (Maya Chen, 全栈工程师): "那个注册弹窗出来问邮箱和工作区名，但这之前没有任何有价值的内容铺垫"

### [i09] MED · 性能感知 — 页面内容加载慢，等待成本高
SCALE: 1/4 agents felt this · 2 events · where: 首页加载过程中
QUOTE (李心怡, 前端组长): "页面终于加载完了。等了快1分钟才看到完整内容。"

### [i10] MED · 信息架构 — 产品定位不明，看不出是做什么的
SCALE: 1/4 agents felt this · 2 events · where: 首页初见，只看到几个按钮时
QUOTE (李心怡, 前端组长): "不知道这个产品是做什么的，光看截图文字信息太少了。"

### [i13] MED · 功能契合 — 底部命令示例的交互按钮不可用
SCALE: 1/4 agents felt this · 1 events · where: 在页面底部的命令示例区域尝试点击
QUOTE (Kenji Okada, 独立开发者): "试试 CLI 命令按钮是否可交互，结果点完还是没反应。"

### [i14] MED · 流程顺畅 — 页面缺乏基本状态反馈机制
SCALE: 1/4 agents felt this · 5 events · where: 所有点击操作后
QUOTE (Kenji Okada, 独立开发者): "点完什么都没发生，没有任何提示——是加载中还是坏了？完全不知道。"

### [i19] MED · 情感氛围 — Anti-pattern label undermines trust without explaining the product
SCALE: 1/4 agents felt this · 1 events · where: Landing page labeled '20-anti-pattern' - confusing whether this is intentional demo of bad patterns or broken real product
QUOTE (Tyler Brooks, DevOps 工程师): "The page is labeled 'anti-pattern' so I'm experiencing exactly that: a broken landing page that shows zero value."

### [i05] LOW · 可访问性 — OSS资源URL暴露在DOM中带signature参数
SCALE: 1/4 agents felt this · 1 events · where: 查看页面DOM结构时发现
QUOTE (Maya Chen, 全栈工程师): "那个OSS图片URL在DOM里裸着，域名还带日期戳，signature参数都看得到"

## DELIGHTS
- **URL标注了 anti-pattern，有一定暗示性** (1× · 李心怡): "URL 里写着 'anti-pattern'，难道这是个'反模式'展示页面？这挺有意思。"
- **CLI 命令示例的想法戳中了我这类开发者** (1× · Kenji Okada): "底部展示 plain status, plain incident open, plain logs --tail 这些命令，有点意思——感觉像是面向开发者/运维人的状态页工具。作为习惯用终端的开发者，这种产品思路挺对我胃口。"
- **CLI-style button labels appeal to my DevOps identity** (1× · Tyler Brooks): "The button labels like 'plain logs --tail' and 'plain status' felt familiar - matching how I think in terminals."

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 点击主按钮 | 25% (1/4) | 0% | -3.0 | 4 |
| 尝试导航功能 | 25% (1/4) | 0% | -3.0 | 3 |
| 点击 Learn more | 25% (1/4) | 0% | -3.0 | 3 |
| 导航切换 | 25% (1/4) | 0% | -3.0 | 3 |
| 功能详情入口 | 25% (1/4) | 0% | -2.0 | 3 |
| 点击CLI按钮 | 25% (1/4) | 0% | -2.0 | 2 |
| Product exploration | 25% (1/4) | 0% | -3.0 | 2 |
| Status page interaction | 25% (1/4) | 0% | -3.0 | 2 |
| 查看首页内容 | 25% (1/4) | 0% | -2.0 | 1 |
| 触发注册弹窗 | 25% (1/4) | 100% | -1.0 | 1 |
| 导航到文档 | 25% (1/4) | 0% | -2.0 | 1 |
| 产品文档入口 | 25% (1/4) | 0% | -2.0 | 1 |
| 价格页面入口 | 25% (1/4) | 0% | -2.0 | 1 |
| Pricing check | 25% (1/4) | 0% | -2.0 | 1 |
| Docs access | 25% (1/4) | 0% | -1.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (54s)
- 李心怡: explored (79s)
- Kenji Okada: frustrated (101s)
- Tyler Brooks: frustrated (103s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/20-anti-pattern/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 11, Rage clicks ≤ 3.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
11 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/20-anti-pattern/site/ --compare run-001` and stop if it regresses.
```