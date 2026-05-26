# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/16-placeholder-label/site/
# generated: 2026-05-26T02:56:30.803Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 48 events
- Predicted NPS: -5 (achievable: 65)
- Task success: 25% · Rage clicks: 4 · Delights: 0
- Sessions: 1 timeout, 1 frustrated, 2 explored
- Cost: $0.00 (173,376 in / 8,652 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 表单焦点混乱，输入内容跑错地方
SCALE: 1/4 agents felt this · 2 events · where: 在表单页填写邮箱地址时
QUOTE (张明辉, 市场总监): "输入的内容全跑到名字框里了！邮箱框没有正确获得焦点，被追加到第一个框了。"

### [i02] HIGH · 流程顺畅 — 点击后直接报错退出了
SCALE: 1/4 agents felt this · 1 events · where: 点击邮箱输入框后
QUOTE (张明辉, 市场总监): "LLM 调用失败：400 invalid params..."

### [i03] HIGH · 功能契合 — 页面明显是 demo，下拉框点不开
SCALE: 1/4 agents felt this · 2 events · where: 点击角色选择下拉框
QUOTE (Kenji Okada, 全栈工程师): "下拉框点了两次都没反应... 算了，URL 里有 'placeholder-label'，这根本就是个 demo 页面，不是真实产品。"

### [i06] HIGH · 功能契合 — 导航链接点不动，不知道是真功能还是摆设
SCALE: 1/4 agents felt this · 2 events · where: 进入页面后想看看Members页面是什么样子，点击导航没反应
QUOTE (李心怡, 行政主管): "点了Members和Invite，页面完全没变化，也不知道这个产品到底有哪些真实功能可以体验。"

### [i09] HIGH · 功能契合 — Members 导航链接点完没反应
SCALE: 1/4 agents felt this · 1 events · where: 在 Invite 页面顶部点击导航
QUOTE (Maya Chen, 产品经理): "点了 Members 但页面没变化？导航似乎不工作。这种基础交互问题会让我对产品失去信心。"

### [i04] MED · 可访问性 — Tab 键跳不到预期位置
SCALE: 1/4 agents felt this · 1 events · where: 在全名输入框按 Tab 切换到邮箱输入框
QUOTE (Kenji Okada, 全栈工程师): "时区快选按钮设计得不错，但 Tab 键跳不到预期位置。"

### [i05] MED · 信息架构 — 导航链接不跳转
SCALE: 1/4 agents felt this · 1 events · where: 点击 Members 导航标签
QUOTE (Kenji Okada, 全栈工程师): "看看 Members 页面长什么样 — 点了没反应，估计也是 demo。"

### [i07] MED · 可访问性 — 角色下拉框点不开，想试都试不了
SCALE: 1/4 agents felt this · 1 events · where: 看到角色字段，想打开下拉框选一个角色
QUOTE (李心怡, 行政主管): "想看看角色有哪些选项，点了一下下拉框，没反应。我还以为是我操作有问题呢。"

### [i08] MED · 流程顺畅 — 字段太多，请个人进群用不着这么复杂
SCALE: 1/4 agents felt this · 1 events · where: 看到整个表单的字段列表
QUOTE (李心怡, 行政主管): "要填七八项，还要选时区、角色、职位……我用钉钉请人就是发个链接加群，一分钟的事。这个太重了。"

### [i10] MED · 流程顺畅 — 表单字段太多，邀请需要的信息过细
SCALE: 1/4 agents felt this · 1 events · where: 滚动查看完整表单时
QUOTE (Maya Chen, 产品经理): "时区、手机号、个人备注...真的需要这么多吗？我只是想邀请个人进 workspace。"

### [i11] LOW · 可访问性 — 全名输入框坐标显示异常
SCALE: 1/4 agents felt this · 1 events · where: 输入名字后第一次观察
QUOTE (Maya Chen, 产品经理): "y坐标是负的？这看起来像是滚动 bug，或者元素定位有问题。"

## DELIGHTS
- **中文名字输入流畅** (1× · 张明辉): "中文输入正常，这个体验不错"
- **时区快选按钮设计贴心** (1× · Kenji Okada): "时区快选按钮设计得不错，PST/EST/UTC+8/UTC 直接点就能选，比手动输入方便。"
- **输入框能正常打字，placeholder写得很清楚** (1× · 李心怡): "嗯，输入框能用，打字正常。这个placeholder显示的是Full name，清晰明白。"
- **基本输入功能正常** (1× · Maya Chen): "输入成功了，名字填上了。时区快捷按钮也能点击，功能基本能用。"
- **布局还算清晰** (1× · Maya Chen): "整体布局还算清晰，能看到 Send invite 按钮和 + Add another。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写邀请表单 | 50% (2/4) | 50% | -0.5 | 3 |
| 表单输入 | 25% (1/4) | 0% | -2.0 | 2 |
| 角色选择下拉框 | 25% (1/4) | 0% | -3.0 | 2 |
| 查看 Members 页面 | 25% (1/4) | 0% | -2.0 | 1 |
| 切换 Invite tab | 25% (1/4) | 0% | +0.0 | 1 |
| 填写姓名 | 25% (1/4) | 100% | +2.0 | 1 |
| 角色下拉选择 | 25% (1/4) | 0% | -1.0 | 1 |
| 导航Members | 25% (1/4) | 0% | -2.0 | 1 |
| 选择时区 | 25% (1/4) | 100% | +0.0 | 1 |
| 导航切换 | 25% (1/4) | 0% | -2.0 | 1 |

## EXIT REASONS
- 张明辉: timeout (42s)
- Kenji Okada: frustrated (81s)
- 李心怡: explored (103s)
- Maya Chen: explored (160s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/16-placeholder-label/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 15, Rage clicks ≤ 2.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
5 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/16-placeholder-label/site/ --compare run-001` and stop if it regresses.
```