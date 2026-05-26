# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/12-noisy-notifs/site/
# generated: 2026-05-26T06:20:55.340Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 15 experience observations across 4 agents · 46 events
- Predicted NPS: 6 (achievable: 76)
- Task success: 50% · Rage clicks: 1 · Delights: 6
- Sessions: 4 explored
- Cost: $0.00 (121,674 in / 8,651 out)

## OBSERVATIONS

### [i01] HIGH · 信息架构 — 落地页缺少任何 CTA 入口，无法注册或申请演示
SCALE: 1/4 agents felt this · 4 events · where: 看完整个页面后，想找注册入口或 Demo 申请入口
QUOTE (Emma Zhang, 项目经理): "一个落地页没有任何 CTA？太奇怪了。我不知道下一步该做什么，只能关掉。"

### [i02] HIGH · 流程顺畅 — 三步流程之后没有引导用户行动的设计
SCALE: 1/4 agents felt this · 1 events · where: 读完三步流程区块后
QUOTE (Emma Zhang, 项目经理): "触发→分析噪音→防止疲劳，逻辑清晰，但看完不知道下一步要干嘛。"

### [i09] HIGH · 情感氛围 — 一次性弹出三个通知，信息过载令人烦躁
SCALE: 1/4 agents felt this · 1 events · where: 点击按钮加载数据后，三个通知同时弹出
QUOTE (李心怡, 运营专员): "有To Do、Reminder和Sales促销通知各一个。这种突然弹出的方式让我有种被信息轰炸的感觉，有点烦躁"

### [i10] HIGH · 功能契合 — 只展示问题不提供解决方案，工具价值缺失
SCALE: 1/4 agents felt this · 1 events · where: 体验完整个演示后
QUOTE (李心怡, 运营专员): "这个工具只展示了问题本身，没有给出任何解决方案或优化建议。我需要的是'怎么让通知安静下来'，而不是'你看通知就是这么吵'"

### [i13] HIGH · 功能契合 — 看板任务点击后没有任何反应
SCALE: 1/4 agents felt this · 1 events · where: 在Dashboard看板列上尝试点击任务卡片
QUOTE (Kenji Okada, 后端工程师): "看板点击似乎没什么反应，可能需要拖拽。但我点了没反应就不知道该怎么办了"

### [i03] MED · 功能契合 — 功能展示区只有文字说明，没有「免费试用」或「查看 Demo」按钮
SCALE: 1/4 agents felt this · 2 events · where: 看到功能展示区时
QUOTE (Emma Zhang, 项目经理): "Notification Inbox 智能分组我喜欢，但我不能点进去试试吗？"

### [i04] MED · 信息架构 — 找不到任何联系方式（邮箱、微信、客服入口）
SCALE: 1/4 agents felt this · 3 events · where: 页面底部找不到任何联系入口
QUOTE (Emma Zhang, 项目经理): "连个联系方式都没有，我怎么问问题？"

### [i05] MED · 信息架构 — 首页没有说明这个工具怎么工作，进来就看到12条通知有点懵
SCALE: 1/4 agents felt this · 1 events · where: 进入localhost:8200/12-noisy-notifs/site/
QUOTE (Maya Chen, 产品经理): "打开了一个关于'噪音通知'的网站，先扫一眼整体布局和主要内容——有点confused，不知道这个工具是干嘛的、解决什么问题、我要从哪开始用"

### [i06] MED · 信息架构 — 通知列表没有标注时间，看到12条通知但不知道是今天的还是积压了好几天的
SCALE: 1/4 agents felt this · 1 events · where: 查看通知列表时
QUOTE (Maya Chen, 产品经理): "右上角铃铛图标带'12'数字说明有未读通知，但没有时间戳让我判断紧急程度"

### [i08] MED · 信息架构 — 空白页面缺少引导，让人不知该做什么
SCALE: 1/4 agents felt this · 1 events · where: 首次进入页面时，只看到标题和一个按钮
QUOTE (李心怡, 运营专员): "这种空白页面让我有点摸不着头脑——不知道点击后会发生什么，也担心会不会突然弹出很多通知"

### [i11] MED · 流程顺畅 — 每次点击都重新触发通知，交互设计不合理
SCALE: 1/4 agents felt this · 2 events · where: 点击待办列表查看内容时
QUOTE (李心怡, 运营专员): "又弹回来了？！每次点击都重新来一遍，这本身就是'Noisy'的体现吧"

### [i12] MED · 功能契合 — 没有退出机制或安静模式选项
SCALE: 1/4 agents felt this · 1 events · where: 体验过程中希望有办法让通知安静下来
QUOTE (李心怡, 运营专员): "如果这是个通知管理工具，我需要看到它怎么帮我解决噪音问题，而不只是把噪音展示给我看"

### [i14] MED · 功能契合 — 缺少拖拽移动任务到其他列的功能
SCALE: 1/4 agents felt this · 1 events · where: 想尝试把In Progress的任务拖到In Review
QUOTE (Kenji Okada, 后端工程师): "这是看板式工具，拖拽应该是基本功能，但我找不到明显的拖拽入口或者拖拽效果"

### [i07] LOW · 信息架构 — 跳转通知偏好设置后，没有明显的返回路径说明我在哪里
SCALE: 1/4 agents felt this · 1 events · where: 点击通知铃铛后弹出设置面板时
QUOTE (Maya Chen, 产品经理): "点击铃铛后弹出设置面板，但面板和主体页面的层级关系不够清晰，我不确定这个设置是弹层还是新页面"

### [i15] LOW · 视觉节奏 — Kanban的列宽在窄屏下可能显示不佳
SCALE: 1/4 agents felt this · 1 events · where: 观察Dashboard的四个状态列
QUOTE (Kenji Okada, 后端工程师): "Dashboard的四个列都挤在一起，内容少的时候看起来很空，内容多的时候又可能溢出"

## DELIGHTS
- **概念直击痛点：「减少通知噪音」正好是企业微信用户的心声** (1× · Emma Zhang): "作为一个每天被企业微信轰炸的人，这个主题很吸引我。"
- **三步流程（触发→分析→防止）逻辑清晰，易理解** (1× · Emma Zhang): "触发→分析噪音→防止疲劳，逻辑清晰。"
- **三个快捷开关+分渠道配置的隐私时段设置，正好解决我半夜被吵醒的痛点** (1× · Maya Chen): "哦，有通知偏好设置页面。三个快捷开关+分渠道配置，比我想象中细致。隐私时段（23:00-07:00）正好戳中我的痛点——之前就是因为半夜被钉钉吵醒才把整个群都静音了"
- **Email分类型开关的颗粒度刚刚好，可以关掉Conference只保留Product launch** (1× · Maya Chen): "Conference meeting我可以关掉——会议通知我不需要邮件提醒，有日历就够了。Product launch这种重要的才需要。这个颗粒度我喜欢"
- **关闭按钮操作流畅，交互反馈清晰** (1× · 李心怡): "关闭按钮可以工作，把Reminder关掉了"
- **Silent Hours功能正好解决我的痛点** (1× · Kenji Okada): "深夜和工作外的非紧急时段静音通知，这个功能太实用了。我现在Slack晚上11点还会响，完全可以设置个静默时段"
- **Emergency override设计合理** (1× · Kenji Okada): "静音不能把真正的紧急告警也关掉。P0级别的问题还是要能叫醒人，这个设计很合理"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 浏览落地页 | 25% (1/4) | 100% | +1.0 | 1 |
| 查看三步流程说明 | 25% (1/4) | 100% | +1.0 | 1 |
| 寻找注册/CTA 入口 | 25% (1/4) | 0% | -2.0 | 1 |
| 查看通知列表 | 25% (1/4) | 100% | +1.0 | 1 |
| 打开通知偏好设置 | 25% (1/4) | 100% | +2.0 | 1 |
| 切换通知渠道标签(Email/Slack/SMS/Desktop) | 25% (1/4) | 100% | +2.0 | 1 |
| 查看分类型通知开关(Conference/Product launch/DevOps/Meeting) | 25% (1/4) | 100% | +2.0 | 1 |
| 加载数据 | 25% (1/4) | 100% | -2.0 | 1 |
| 关闭通知 | 25% (1/4) | 100% | +0.0 | 1 |
| 查看待办列表 | 25% (1/4) | 0% | -2.0 | 1 |
| 查看Dashboard看板 | 25% (1/4) | 100% | +1.0 | 1 |
| 浏览通知收件箱 | 25% (1/4) | 100% | +2.0 | 1 |
| 查看通知渠道配置 | 25% (1/4) | 100% | +2.0 | 1 |
| 查看静音规则配置 | 25% (1/4) | 100% | +2.0 | 1 |
| 看板任务拖拽 | 25% (1/4) | 0% | -1.0 | 1 |

## EXIT REASONS
- Emma Zhang: explored (107s)
- Maya Chen: explored (115s)
- 李心怡: explored (119s)
- Kenji Okada: explored (194s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/12-noisy-notifs/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 26, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
5 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/12-noisy-notifs/site/ --compare run-001` and stop if it regresses.
```