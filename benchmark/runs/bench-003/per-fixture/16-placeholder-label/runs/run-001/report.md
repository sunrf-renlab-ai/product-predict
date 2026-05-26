# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/16-placeholder-label/site/
# generated: 2026-05-26T06:28:09.913Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 63 events
- Predicted NPS: -3 (achievable: 81)
- Task success: 75% · Rage clicks: 2 · Delights: 0
- Sessions: 3 explored, 1 frustrated
- Cost: $0.00 (332,644 in / 8,099 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 表单输入后弹出技术报错，用户看不懂
SCALE: 1/4 agents felt this · 1 events · where: 在姓名输入框输入文字后点击测试按钮
QUOTE (王莉, 运营专员): "expected number, got undefined——这啥意思？我填个名字你给我看代码报错？"

### [i03] HIGH · 流程顺畅 — 提交邀请后没有任何反馈提示
SCALE: 1/4 agents felt this · 1 events · where: 填写完 Full name、Email，点击 Send Invite 按钮后
QUOTE (林浩宇, 自由设计师): "点了发送邀请好像没什么反应。没有提示信息，不知道成功了还是字段不全。这点让我不太确定。"

### [i05] HIGH · 信息架构 — Members 导航链接点击后无响应
SCALE: 1/4 agents felt this · 1 events · where: 在 Invite 页面的导航栏点击 Members 链接
QUOTE (Kenji Okada, 工程团队负责人): "Members 链接没反应，页面没切换。我以为能切换到成员列表，结果点了跟没点一样。"

### [i06] HIGH · 流程顺畅 — Tab键跳转顺序与表单字段顺序不一致，输入跑到错误位置
SCALE: 1/4 agents felt this · 2 events · where: 在Department字段输入「研发部」后按Tab，光标跳到了Full name而不是预期的下一个字段
QUOTE (Maya Chen, 人事经理): "卧槽数据填串了！我明明要填Department，结果跑到Full name去了？Tab顺序肯定有问题。"

### [i07] HIGH · 流程顺畅 — 输入框内Ctrl+A是追加而非替换，选中操作无效
SCALE: 1/4 agents felt this · 2 events · where: 发现Full name字段已有错误内容「张三研发部」，尝试Ctrl+A全选后重新输入，但内容被追加而非替换
QUOTE (Maya Chen, 人事经理): "Ctrl+A根本不是选中替换，是在后面追加！这表单Tab顺序混乱，而且输入逻辑也有问题。"

### [i08] HIGH · 流程顺畅 — 三重点击无法全选文本，修正操作完全失效
SCALE: 1/4 agents felt this · 1 events · where: 尝试Triple click全选文本但不起作用，无法修正已填错的字段
QUOTE (Maya Chen, 人事经理): "又串了！变成了「张三研发部」——三重点击也无法选中。"

### [i02] MED · 流程顺畅 — placeholder测试没有操作反馈
SCALE: 1/4 agents felt this · 1 events · where: 点击placeholder测试按钮后
QUOTE (王莉, 运营专员): "点完测试按钮不知道有没有生效，要自己再看看placeholder变了没有"

### [i04] MED · 性能感知 — 输入名字时报控制台错误
SCALE: 1/4 agents felt this · 1 events · where: 在 Full name 输入框键入「林浩宇」时
QUOTE (林浩宇, 自由设计师): "expected number, got undefined — 填个字怎么还报错了？"

### [i09] MED · 信息架构 — 时区字段同时有输入框和快捷按钮，设计重复造成困惑
SCALE: 1/4 agents felt this · 1 events · where: 看到时区部分既有自由输入框又有快捷按钮按钮，不确定它们的关系
QUOTE (Maya Chen, 人事经理): "时区那边有个输入框「e.g. PST, EST, UTC+8」，下面又有一排按钮PST、EST、UTC+8、UTC……这俩是啥关系？"

### [i10] MED · 视觉节奏 — 角色下拉菜单打开状态不明显，无法确认当前选择
SCALE: 1/4 agents felt this · 1 events · where: 点击Role字段的下拉按钮，想看有哪些角色选项，但不确定菜单是否打开
QUOTE (Maya Chen, 人事经理): "下拉菜单到底打开没？看不明显。"

## DELIGHTS
- **表单示例覆盖完整，姓名邮箱部门时区备注都有** (1× · 王莉): "这表单场景挺全的，运营常用的都覆盖到了，看一眼就知道是做什么的"
- **页面布局清晰，表单卡片排版舒服** (1× · 王莉): "看起来不乱，每个输入框的placeholder文字也正好能提示我该填什么"
- **界面简洁，字段排布清晰合理** (1× · 林浩宇): "有点像 Notion 邀请新成员的感觉，但这里是直接收集详细信息。整体风格挺干净。"
- **placeholder 提示很实用** (1× · 林浩宇): "字段里给提示占位，告诉我该填什么，这点做得不错。"
- **快捷时区按钮设计贴心** (1× · 林浩宇): "不用自己查时区，点一下就选好了，小细节做得用心。"
- **时区快捷按钮实用** (1× · Kenji Okada): "PST/EST/UTC+8 这种快捷按钮设计很贴心，不用一个个找时区了。"
- **权限角色粒度合理** (1× · Kenji Okada): "Member/Admin/Guest 三个角色划分清晰，我作为工程团队负责人会选 Admin，这个粒度够用了。"
- **时区快捷按钮点击后自动填入输入框，省去打字步骤** (1× · Maya Chen): "点按钮会自动填到输入框里——这个设计合理，省得我手动打字了。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写表单 | 25% (1/4) | 0% | -3.0 | 5 |
| 测试placeholder显示 | 25% (1/4) | 100% | +1.0 | 2 |
| 切换时区按钮 | 25% (1/4) | 100% | +1.0 | 2 |
| 选择角色下拉 | 25% (1/4) | 0% | -1.0 | 2 |
| 表单输入 | 25% (1/4) | 100% | -2.0 | 1 |
| 填写邀请表单 | 25% (1/4) | 0% | +1.0 | 1 |
| 提交邀请 | 25% (1/4) | 0% | -2.0 | 1 |
| 选择时区 | 25% (1/4) | 100% | +2.0 | 1 |
| 邀请成员表单 | 25% (1/4) | 100% | +2.0 | 1 |
| 角色选择下拉 | 25% (1/4) | 100% | +2.0 | 1 |
| 时区选择 | 25% (1/4) | 100% | +2.0 | 1 |

## EXIT REASONS
- 王莉: explored (49s)
- 林浩宇: explored (70s)
- Kenji Okada: explored (98s)
- Maya Chen: frustrated (217s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/16-placeholder-label/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 17, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
6 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/16-placeholder-label/site/ --compare run-001` and stop if it regresses.
```