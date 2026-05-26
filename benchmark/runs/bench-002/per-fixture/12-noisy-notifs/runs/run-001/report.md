# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/12-noisy-notifs/site/
# generated: 2026-05-26T02:50:59.284Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 9 experience observations across 4 agents · 45 events
- Predicted NPS: -2 (achievable: 54)
- Task success: 25% · Rage clicks: 0 · Delights: 0
- Sessions: 3 explored, 1 timeout
- Cost: $0.00 (122,403 in / 8,554 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 想用但还没用上就被打断了
SCALE: 1/4 agents felt this · 1 events · where: 在首页不断滚动查看产品介绍内容
QUOTE (Kenji Okada, 前端工程师): "我还没点进去看任何具体功能，就在主页滚了半天，结果就超时了——好没劲啊，感觉自己白逛了"

### [i03] HIGH · 功能契合 — 搜索形同虚设，输入关键词完全不生效
SCALE: 1/4 agents felt this · 3 events · where: 在通知列表页顶部尝试用关键词过滤通知
QUOTE (Maya Chen, 产品经理): "我输完product按了Enter又点搜索按钮，列表纹丝不动，这搜索是摆设吧？"

### [i06] HIGH · 信息架构 — 产品定位模糊，不知道它装在哪里
SCALE: 1/4 agents felt this · 3 events · where: 刚进入页面时，没有清晰的说明这是什么产品、安装在哪里、和现有工具的关系
QUOTE (李心怡, 运营专员): "这是干什么的？是给我配置自己的通知规则，还是在展示噪音通知的问题？我还是不清楚它是独立的App还是集成在我现有的钉钉上。"

### [i08] HIGH · 功能契合 — 价值主张不清晰，没有让我觉得非用它不可的理由
SCALE: 1/4 agents felt this · 2 events · where: 浏览完整个页面后
QUOTE (李心怡, 运营专员): "为什么要再多一个通知聚合工具？页面上的通知本身就很杂乱，加了分类标签也没让我觉得变安静了。"

### [i02] MED · 视觉节奏 — 首页展示不够让我立刻想行动
SCALE: 1/4 agents felt this · 1 events · where: 滚动浏览完整个首页后停留在底部
QUOTE (Kenji Okada, 前端工程师): "看完介绍我还在犹豫要不要登录试试，感觉信息有点多，我不太确定这个digest会给我带来什么具体价值"

### [i04] MED · 可访问性 — Filter按钮点了没反应，不知道能怎么筛选
SCALE: 1/4 agents felt this · 3 events · where: 尝试点击Filter按钮查看过滤选项
QUOTE (Maya Chen, 产品经理): "点了好几次Filter什么都没出来，我都不知道这个产品支持什么过滤维度"

### [i05] MED · 功能契合 — 没有协作相关功能，PM用不了
SCALE: 1/4 agents felt this · 1 events · where: 整体评估这个工具能否融入日常工作流
QUOTE (Maya Chen, 产品经理): "我团队8个人，这种纯个人收件箱工具没法用，我们得知道谁读了谁没读"

### [i07] MED · 流程顺畅 — Mentions标签点击没反应，体验断点
SCALE: 1/4 agents felt this · 1 events · where: 在顶部分类标签区域点击Mentions
QUOTE (李心怡, 运营专员): "点击了Mentions标签，但好像没选中。可能Mentions是空的？还是点击没反应。"

### [i09] MED · 情感氛围 — AI功能要付费，还没感受到价值就先看到门槛
SCALE: 1/4 agents felt this · 1 events · where: 看到页面下方的AI summary功能提示
QUOTE (李心怡, 运营专员): "有个Try our AI summary feature，旁边有锁的图标。看个功能介绍还要付费，让我有点抵触。"

## DELIGHTS
- **预览面板实时看到效果** (1× · 王磊): "左边预览右边配置，挺好懂的，不用猜自己改的对不对"
- **安静时段设置很直觉** (1× · 王磊): "弹出时间选择器，设置开始结束时间，一点都不复杂"
- **'Daily Digests'和'People Weekly'这两个概念戳到我了** (1× · Kenji Okada): "作为一个被各种 HR 邮件轰炸的人，如果真能帮我整理一个每日摘要，我会感兴趣的"
- **紫色渐变背景看起来挺现代的** (1× · Kenji Okada): "视觉上第一印象还不错，不像老旧的 HR 系统"
- **详情面板滑出的交互很顺滑** (1× · Maya Chen): "点开通知右边滑出来一个面板，比跳转到新页面流畅多了，这个细节做得不错"
- **界面布局清晰，扫一眼就知道是通知收件箱** (1× · Maya Chen): "视觉层次分明，左边列表右边详情，不会迷路"
- **Snooze功能戳中痛点** (1× · 李心怡): "30分钟后提醒这个功能挺好的，我开会忙的时候确实需要这种临时静音的能力。"
- **通知分类的思路方向对** (1× · 李心怡): "把Mentions、Assignments这些分开的想法是好的，至少比钉钉所有消息混在一起强。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 查看通知详情 | 50% (2/4) | 100% | +1.0 | 2 |
| 搜索过滤 | 25% (1/4) | 0% | -2.0 | 3 |
| Filter筛选 | 25% (1/4) | 0% | -1.0 | 3 |
| 浏览通知列表 | 25% (1/4) | 100% | +1.0 | 2 |
| 开关通知类型 | 25% (1/4) | 100% | +2.0 | 1 |
| 设置安静时段 | 25% (1/4) | 100% | +2.0 | 1 |
| 查看预览面板 | 25% (1/4) | 100% | +2.0 | 1 |
| 标记全部已读 | 25% (1/4) | 100% | +0.0 | 1 |
| 切换分类标签 | 25% (1/4) | 0% | -1.0 | 1 |
| 浏览搜索框 | 25% (1/4) | 0% | +0.0 | 1 |

## EXIT REASONS
- 王磊: explored (80s)
- Kenji Okada: timeout (83s)
- Maya Chen: explored (103s)
- 李心怡: explored (149s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/12-noisy-notifs/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 18, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
4 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/12-noisy-notifs/site/ --compare run-001` and stop if it regresses.
```