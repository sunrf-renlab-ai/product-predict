# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/13-mobile-broken/site/
# generated: 2026-05-26T02:51:36.995Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 32 events
- Predicted NPS: -13 (achievable: 57)
- Task success: 0% · Rage clicks: 4 · Delights: 0
- Sessions: 4 frustrated
- Cost: $0.00 (130,550 in / 6,023 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 核心交互全部失效，直接阻断使用
SCALE: 1/4 agents felt this · 3 events · where: 在内容卡片上尝试 Upvote 和 Comment，在顶部尝试分类切换
QUOTE (Maya Chen, 产品经理): "我在跟一面墙交互。彻底放弃。"

### [i03] HIGH · 功能契合 — 所有按钮点击都完全没反应，页面像死了一样
SCALE: 1/4 agents felt this · 3 events · where: 在帖子列表页面尝试点击顶部分类筛选按钮和帖子上的交互按钮
QUOTE (李心怡, UI 设计实习生): "点什么都没反应！作为一个真实用户，遇到这种情况我早就关掉了。"

### [i06] HIGH · 功能契合 — 所有点击都是静默失败，完全没有反馈
SCALE: 1/4 agents felt this · 6 events · where: 在分类筛选按钮(F、R、B等)和互动按钮(Upvote、Comment)上尝试点击
QUOTE (王磊, 运营经理): "点什么都石沉大海，我不知道是我操作问题还是网站问题"

### [i08] HIGH · 可访问性 — 页面内容完全不可见，像打开了一个坏掉的网页
SCALE: 1/4 agents felt this · 5 events · where: 进入页面后，顶部有一排 F R B A N S 按钮，下面能看到 Upvote 和 Comment，但中间实际的反馈内容在哪里？
QUOTE (Kenji Okada, 咖啡店主理): "这页面名字叫'broken-mobile'，我猜这是个演示移动端问题的页面。但我用的是桌面浏览器，看不到任何反馈内容，只有几个孤零零的按钮在外面飘着。"

### [i09] HIGH · 流程顺畅 — 所有按钮点下去毫无反应，感觉像在戳一堵墙
SCALE: 1/4 agents felt this · 6 events · where: 依次尝试点击顶部分类按钮、Upvote 按钮、Comment 按钮，每次都没有任何 UI 响应。
QUOTE (Kenji Okada, 咖啡店主理): "我点了 Upvote，想看看有没有点赞的反馈效果，点 Comment 想看看能不能评论，结果点什么都没有任何变化。"

### [i02] MED · 情感氛围 — 没有任何错误提示，不知道是自己操作问题还是系统问题
SCALE: 1/4 agents felt this · 1 events · where: 第一次点击 Comment 按钮后等待响应
QUOTE (Maya Chen, 产品经理): "点 Comment 按钮没反应？页面完全没有变化，评论弹窗没出来。这交互是坏的吗？"

### [i04] MED · 学习成本 — 顶部的F R B A N S按钮不知道是什么意思
SCALE: 1/4 agents felt this · 1 events · where: 页面加载完成后首先注意到顶部这排字母按钮
QUOTE (李心怡, UI 设计实习生): "顶部有一排字母按钮 F R B A N S，不知道是什么意思。让我试试点一下F按钮看看是什么功能。"

### [i07] MED · 流程顺畅 — 没有任何引导或提示，像个半成品
SCALE: 1/4 agents felt this · 1 events · where: 页面加载后尝试各项功能
QUOTE (王磊, 运营经理): "看起来有功能但用不了，跟看了一堆灰掉的按钮一样"

### [i10] MED · 学习成本 — 顶部那排按钮是什么意思，我猜不出来
SCALE: 1/4 agents felt this · 2 events · where: 进入页面后首先注意到顶部有一排单字母按钮，但没有说明。
QUOTE (Kenji Okada, 咖啡店主理): "F R B A N S 这六个字母到底代表什么？Feature、Review、Bug？没有任何文字标签，完全看不懂。"

### [i05] LOW · 视觉节奏 — 帖子内容看起来是Reddit风格但细节模糊
SCALE: 1/4 agents felt this · 1 events · where: 初次扫视页面时试图理解整体布局
QUOTE (李心怡, UI 设计实习生): "页面上有一堆Upvote和Comment按钮，感觉是个帖子列表？让我先滚动看看整体布局。"

## DELIGHTS
- **帖子结构清晰，有标题、upvote数、comment数** (1× · 李心怡): "虽然按钮没反应，但帖子本身有标题、点赞数、评论数这些信息，看起来结构还挺明确的。"
- **页面布局还算清晰，能看到内容列表结构** (1× · 王磊): "标题看着挺有节奏感的，分类标签排列也整齐"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 分类筛选 | 50% (2/4) | 0% | -3.0 | 8 |
| 查看评论 | 50% (2/4) | 0% | -3.0 | 2 |
| 切换分类筛选 | 25% (1/4) | 0% | -1.0 | 3 |
| 点赞帖子 | 25% (1/4) | 0% | -3.0 | 2 |
| 点赞反馈 | 25% (1/4) | 0% | -3.0 | 2 |
| 评论反馈 | 25% (1/4) | 0% | -3.0 | 2 |
| 浏览内容卡片 | 25% (1/4) | 100% | +0.0 | 1 |
| 点赞内容 | 25% (1/4) | 0% | -2.0 | 1 |
| 评论内容 | 25% (1/4) | 0% | -2.0 | 1 |
| 帖子列表浏览 | 25% (1/4) | 0% | +0.0 | 1 |
| Upvote点赞 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看反馈列表 | 25% (1/4) | 0% | -3.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (37s)
- 李心怡: frustrated (59s)
- 王磊: frustrated (99s)
- Kenji Okada: frustrated (144s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/13-mobile-broken/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 7, Rage clicks ≤ 2.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
5 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/13-mobile-broken/site/ --compare run-001` and stop if it regresses.
```