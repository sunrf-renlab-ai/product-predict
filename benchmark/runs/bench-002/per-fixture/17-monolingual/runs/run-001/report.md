# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/17-monolingual/site/
# generated: 2026-05-26T02:55:49.585Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 12 experience observations across 4 agents · 49 events
- Predicted NPS: -8 (achievable: 100)
- Task success: 0% · Rage clicks: 5 · Delights: 0
- Sessions: 4 explored
- Cost: $0.00 (168,769 in / 6,792 out)

## OBSERVATIONS

### [i01] HIGH · 性能感知 — 工作区链接点不动，像死链接一样
SCALE: 1/4 agents felt this · 1 events · where: 在首页点击工作区链接
QUOTE (李心怡, 行政主管): "点工作区一点反应都没有，这链接是不是坏了？"

### [i02] HIGH · 信息架构 — 看不懂这系统是干嘛的，跟钉钉完全不一样
SCALE: 1/4 agents felt this · 1 events · where: 在首页浏览整体内容
QUOTE (李心怡, 行政主管): "看了半天这就是个设置页面，配时区和语言的，跟我日常要用的审批、请假、报销完全不一样。钉钉好歹打开就能看到审批入口，这个……我看不懂它是干嘛的。"

### [i04] HIGH · 功能契合 — 看完不知道这产品能做什么
SCALE: 1/4 agents felt this · 1 events · where: 从设置页进入，到达首页
QUOTE (王磊, 后端工程师): "不知道这是什么产品，也不知道能用来做什么。"

### [i05] HIGH · 信息架构 — 首页看起来几乎是空的
SCALE: 1/4 agents felt this · 1 events · where: 尝试返回首页时
QUOTE (王磊, 后端工程师): "回到了根路径，但页面看起来几乎是空的？或者只是一张图片。"

### [i06] HIGH · 信息架构 — 找不到主功能入口在哪
SCALE: 1/4 agents felt this · 1 events · where: 整体浏览过程中
QUOTE (王磊, 后端工程师): "没有明显的功能入口或使用场景。"

### [i07] HIGH · 流程顺畅 — 语言下拉框点了两次都没反应
SCALE: 1/4 agents felt this · 4 events · where: 在工作区设置页点击语言选择下拉框
QUOTE (Maya Chen, 产品经理): "点了两次下拉都没反应，怀疑下拉框根本没打开，还是只看到选中项。感觉交互有点怪。"

### [i08] HIGH · 功能契合 — 搜索框能打字但没有任何搜索结果
SCALE: 1/4 agents felt this · 2 events · where: 在搜索框输入「语言」后等待结果
QUOTE (Maya Chen, 产品经理): "搜索框能打字但没有任何搜索结果下拉出来——这个 demo 基本是个半成品。"

### [i09] HIGH · 情感氛围 — 整体体验像是 Demo 而不是可用的产品
SCALE: 1/4 agents felt this · 1 events · where: 整体感受
QUOTE (Maya Chen, 产品经理): "这种「看起来有功能但实际跑不通」的产品第一印象很差——如果这是竞品，我不会有切换意愿。"

### [i10] HIGH · 功能契合 — 语言和时区选择器完全无法使用
SCALE: 1/4 agents felt this · 4 events · where: 在页面中间点击语言选择器和时区下拉框
QUOTE (Kenji Okada, UI设计师): "select元素完全没反应，点击了无数次。这到底是故意disabled的demo还是真坏了？"

### [i03] MED · 流程顺畅 — 除了配置项没有其他功能，不知道从哪开始
SCALE: 1/4 agents felt this · 1 events · where: 在首页浏览
QUOTE (李心怡, 行政主管): "就几个输入框让我改时区语言，完全看不懂这系统是干什么的，没有审批入口、没有数据统计。"

### [i11] MED · 信息架构 — 产品定位混乱让我困惑
SCALE: 1/4 agents felt this · 2 events · where: 刚进入页面时观察URL和表单字段
QUOTE (Kenji Okada, UI设计师): "URL叫monolingual却有多语言选项，讽刺。跟竞品比起来感觉定位不清晰。"

### [i12] MED · 视觉节奏 — 页面内容贫瘠，没有探索动力
SCALE: 1/4 agents felt this · 3 events · where: 尝试点击工作区链接和滚动页面
QUOTE (Kenji Okada, UI设计师): "这页面感觉就是单一页面，没有侧边栏导航，没什么可探索的。"

## DELIGHTS
- **界面排版还算简洁清爽** (1× · 李心怡): "界面很简洁，至少看起来不乱。"
- **设置页面的布局还算清晰** (1× · 王磊): "界面挺简洁的。"
- **布局和 Notion 设置页有点像，第一眼有熟悉感** (1× · Maya Chen): "布局有点像 Notion 的设置。"
- **界面风格比较简洁，没有多余装饰** (1× · Kenji Okada): "页面挺干净的，没有乱七八糟的弹窗。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 搜索功能 | 50% (2/4) | 0% | -2.0 | 2 |
| 语言选择器 | 25% (1/4) | 0% | -3.0 | 4 |
| 语言切换 | 25% (1/4) | 0% | -2.0 | 3 |
| 工作区设置表单 | 25% (1/4) | 0% | -2.0 | 3 |
| 点击工作区 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看设置页面 | 25% (1/4) | 0% | -2.0 | 1 |
| 搜索 | 25% (1/4) | 0% | -1.0 | 1 |
| 切换语言 | 25% (1/4) | 0% | -2.0 | 1 |
| 查看设置 | 25% (1/4) | 100% | +0.0 | 1 |

## EXIT REASONS
- 李心怡: explored (38s)
- 王磊: explored (77s)
- Maya Chen: explored (118s)
- Kenji Okada: explored (119s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/17-monolingual/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 12, Rage clicks ≤ 3.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
9 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/17-monolingual/site/ --compare run-001` and stop if it regresses.
```