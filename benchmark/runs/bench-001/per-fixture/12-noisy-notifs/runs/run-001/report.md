# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/12-noisy-notifs/site/
# generated: 2026-05-25T11:30:05.951Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 58 events
- Predicted NPS: -10 (achievable: 100)
- Task success: 0% · Rage clicks: 7 · Delights: 1
- Sessions: 3 frustrated, 1 timeout
- Cost: $0.00 (149,327 in / 9,652 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 铃铛点不开，核心交互废了
SCALE: 1/4 agents felt this · 2 events · where: 在首页看到铃铛上有9+红色角标，想点开看看内容
QUOTE (Kenji Okada, 后端工程师): "点两次铃铛都没反应，不知道是点击位置不对还是这玩意儿就是坏的"

### [i02] HIGH · 流程顺畅 — 通知列表里的条目也点不开
SCALE: 1/4 agents felt this · 1 events · where: 打开Inbox看到通知列表，试着点击其中一条通知详情
QUOTE (Kenji Okada, 后端工程师): "通知点了没反应，整个产品的核心交互基本都坏了"

### [i04] HIGH · 流程顺畅 — 规则添加流程形同虚设，输入框根本用不上
SCALE: 1/4 agents felt this · 1 events · where: 在通知规则设置弹窗内操作时
QUOTE (Maya Chen, 产品经理): "点击'添加规则'直接触发保存了，根本没给输入的机会。输入框在眼睛下面但根本没用上。弹窗消失，规则直接保存了？这交互太奇怪了，完全不符合我的预期。"

### [i05] HIGH · 流程顺畅 — 来源下拉框触发意外行为，弹窗直接关闭
SCALE: 1/4 agents felt this · 1 events · where: 在通知规则设置弹窗内点击来源下拉框时
QUOTE (Maya Chen, 产品经理): "点来源那里好像触发了什么，又回到主页了。刚输入的'周报'关键词也没了。有点烦。"

### [i06] HIGH · 功能契合 — 免打扰模式触发通知，逻辑自相矛盾
SCALE: 1/4 agents felt this · 1 events · where: 在通知设置面板关闭免打扰模式后，右侧聊天区弹出toast提示
QUOTE (王磊, 部门主管): "刚关掉免打扰模式，马上弹出一个toast提示……这算什么？噪音零容忍的人最烦的就是这种「善意提醒」，我本来就要安静，你又给我弹一条。"

### [i07] HIGH · 表达文案 — toast内容与实际操作不符
SCALE: 1/4 agents felt this · 1 events · where: 关闭消息提醒后，toast提示内容显示错误
QUOTE (王磊, 部门主管): "我明明关掉了消息提醒，toast却说我开启了。这bug还是我理解错了？"

### [i09] HIGH · 流程顺畅 — 通知铃铛点了三次都没反应，直接失去耐心
SCALE: 1/4 agents felt this · 5 events · where: 进入首页后看到铃铛上有红点和99+标识，想点开看看通知内容
QUOTE (Lucas Schmidt, 项目经理): "通知铃铛点了好几次都没反应，不知道是坏了还是通知太多了？不太爽。"

### [i10] HIGH · 情感氛围 — 99+通知像轰炸机，完全感受不到'智能'
SCALE: 1/4 agents felt this · 2 events · where: 通知面板终于打开后看到堆积如山的通知列表
QUOTE (Lucas Schmidt, 项目经理): "这通知已经多得有点吓人了。99+个通知是什么鬼？"

### [i03] MED · 信息架构 — 每个任务都带🔔徽章，视觉上很吵
SCALE: 1/4 agents felt this · 1 events · where: 滚动浏览任务列表时注意到每个任务右侧的🔔徽章
QUOTE (Kenji Okada, 后端工程师): "每个任务右边都有个🔔+数字的图标，感觉挺多余的"

### [i08] MED · 可访问性 — 聊天区始终显示暂无消息，无法验证设置效果
SCALE: 1/4 agents felt this · 1 events · where: 进入产品后，右侧聊天区始终为空
QUOTE (王磊, 部门主管): "右边的聊天界面还显示「暂无消息」，根本没有任何实际内容来验证这些设置对不对。"

### [i11] MED · 信息架构 — 通知面板要导航才能打开，而不是铃铛弹窗
SCALE: 1/4 agents felt this · 3 events · where: 在首页点击通知铃铛但无响应后尝试导航到通知页面
QUOTE (Lucas Schmidt, 项目经理): "通知铃铛点了好几次都没反应，不知道是坏了还是通知面板已经在某处显示但我没注意到。"

## DELIGHTS
- **界面风格有Linear的味道** (1× · Kenji Okada): "这界面有点像 Linear 或 JIRA 的风格，看着挺顺眼的"
- **弹窗里有来源+关键词双维度，可自定义程度不错** (1× · Maya Chen): "弹窗里有来源、关键词两个标签，可以自定义过滤条件。这个比刚才的三个开关实用多了。"
- **通知设置面板把控制权集中到一起** (1× · 王磊): "通知面板列出了几类通知开关：免打扰模式、消息提醒、声音提示、桌面通知、语言播报。这个设计思路不错，把通知控制权都集中到一起了。企业微信里要找这些设置要翻好几层菜单。"
- **看板布局和 Trello 很像，上手没门槛** (1× · Lucas Schmidt): "这个布局和 Trello 挺像的，上手应该快。"
- **通知面板最终能打开，看到团队动态** (1× · Lucas Schmidt): "通知面板终于弹出来了！团队成员增加了。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 查看通知列表 | 50% (2/4) | 50% | -2.0 | 6 |
| 添加通知规则 | 25% (1/4) | 0% | -3.0 | 3 |
| 浏览任务列表 | 25% (1/4) | 100% | +0.0 | 1 |
| 查看通知详情 | 25% (1/4) | 0% | -3.0 | 1 |
| 通知设置面板 | 25% (1/4) | 100% | +1.0 | 1 |
| 开关免打扰模式 | 25% (1/4) | 100% | -2.0 | 1 |
| 关闭消息提醒 | 25% (1/4) | 100% | -1.0 | 1 |
| 查看看板主页 | 25% (1/4) | 100% | +1.0 | 1 |

## EXIT REASONS
- Kenji Okada: frustrated (108s)
- Maya Chen: frustrated (133s)
- 王磊: frustrated (134s)
- Lucas Schmidt: timeout (144s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/12-noisy-notifs/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 10, Rage clicks ≤ 5.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
8 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/12-noisy-notifs/site/ --compare run-001` and stop if it regresses.
```