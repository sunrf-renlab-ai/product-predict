# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/17-monolingual/site/
# generated: 2026-05-25T11:36:15.945Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 12 experience observations across 4 agents · 49 events
- Predicted NPS: -7 (achievable: 100)
- Task success: 0% · Rage clicks: 2 · Delights: 0
- Sessions: 3 explored, 1 timeout
- Cost: $0.00 (168,662 in / 9,057 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 搜索框输完一点反应都没有
SCALE: 1/4 agents felt this · 4 events · where: 在页面顶部的搜索框输入了「语言」，尝试按回车、清空、再输入，折腾了半天什么结果都没有。
QUOTE (Maya Chen, UI设计师): "搜索功能形同虚设，输入后没有任何反馈或结果。"

### [i02] HIGH · 信息架构 — 页面内容少得可怜
SCALE: 1/4 agents felt this · 3 events · where: 打开设置页面，发现只有团队名称、频道名、时区三个输入框，没有更多层级或内容。
QUOTE (Maya Chen, UI设计师): "整个页面只有几个固定字段，翻来翻去就这点东西，没有更多内容可探索。"

### [i04] HIGH · 信息架构 — 新用户进来看到配置页，完全不知道这产品是啥
SCALE: 1/4 agents felt this · 1 events · where: 进入首页看到配置页面
QUOTE (王磊, 项目经理): "这到底是干什么的？页面只有配置字段，没有产品介绍。我一个PM连入口都不知道往哪走。"

### [i05] HIGH · 功能契合 — 搜索功能形同虚设，完全没有响应
SCALE: 1/4 agents felt this · 2 events · where: 在搜索框输入内容尝试搜索
QUOTE (王磊, 项目经理): "我输入了'团队'，按回车，什么都没发生。又试了'帮助'，还是没反应。这功能是不是坏了？"

### [i06] HIGH · 学习成本 — 没有任何引导或说明，不知道下一步该干嘛
SCALE: 1/4 agents felt this · 1 events · where: 扫视整个页面寻找入口
QUOTE (王磊, 项目经理): "看完页面我一脸懵，没有任何提示告诉我这个产品怎么用、需要配置什么、配置完能干什么。"

### [i07] HIGH · 信息架构 — 进来就见设置页，不知道产品是干嘛的
SCALE: 1/4 agents felt this · 4 events · where: 刚进入 http://localhost:8200/17-monolingual/site/ 时
QUOTE (李心怡, 运营专员): "这个页面看起来是个设置面板，有团队名、时区这些配置。但我完全不知道这个产品是做什么的，它能帮运营做什么？没有首页/导航让我了解全貌？"

### [i08] HIGH · 学习成本 — 没有引导，不知道从哪开始
SCALE: 1/4 agents felt this · 2 events · where: 进入页面后尝试往下滑动探索时
QUOTE (李心怡, 运营专员): "让我先往下滑看看页面的其他部分。我以为下面可能有说明或者首页内容，结果还是表单。"

### [i10] HIGH · 流程顺畅 — 保存操作后零反馈，不知道有没有生效
SCALE: 1/4 agents felt this · 1 events · where: 在设置页点击保存按钮后
QUOTE (Kenji Okada, 财务分析师): "保存后没有任何提示，不确定设置是否生效。作为数据敏感型用户，不喜欢这种黑盒子操作。"

### [i11] HIGH · 学习成本 — 字段术语看不懂，表单对我毫无意义
SCALE: 1/4 agents felt this · 2 events · where: 在设置表单页面观察各字段
QUOTE (Kenji Okada, 财务分析师): "'明镜内部'和'mingjing-team'是什么意思？是模型ID还是什么？我一个财务分析师完全不知道这些字段能帮我做什么。"

### [i12] HIGH · 功能契合 — 这个产品解决什么问题？我找不到自己的使用场景
SCALE: 1/4 agents felt this · 3 events · where: 在整个页面浏览过程中
QUOTE (Kenji Okada, 财务分析师): "我是财务分析师，完全不知道这东西能帮我做什么财务工作。感觉就是个技术配置页面，跟我的日常工作八竿子打不着。"

### [i03] MED · 流程顺畅 — Save/Cancel点了也白点
SCALE: 1/4 agents felt this · 2 events · where: 尝试点击Save和Cancel按钮，不知道有没有生效，界面也没有任何变化反馈。
QUOTE (Maya Chen, UI设计师): "Save/Cancel按钮无法改变任何状态。"

### [i09] MED · 流程顺畅 — 搜索功能感觉没效果，不知道搜什么关键词
SCALE: 1/4 agents felt this · 3 events · where: 在搜索框输入API并按Enter时
QUOTE (李心怡, 运营专员): "清空搜索框并重试... 尝试触发搜索 [Enter]，但好像什么都没发生。"

## DELIGHTS
- **有快捷键支持，清空搜索框挺顺手** (1× · 李心怡): "按 Escape 清空搜索框，这个我记得，Canva 里也有，挺好用的。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 搜索 | 50% (2/4) | 0% | -2.0 | 8 |
| 保存设置 | 50% (2/4) | 0% | -1.0 | 2 |
| 页面浏览 | 25% (1/4) | 0% | -2.0 | 3 |
| 浏览设置页面 | 25% (1/4) | 0% | -2.0 | 2 |
| 搜索功能 | 25% (1/4) | 0% | -3.0 | 2 |
| 搜索过滤 | 25% (1/4) | 0% | +0.0 | 2 |

## EXIT REASONS
- Maya Chen: explored (74s)
- 王磊: explored (85s)
- 李心怡: timeout (105s)
- Kenji Okada: explored (120s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/17-monolingual/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 13, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
10 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/17-monolingual/site/ --compare run-001` and stop if it regresses.
```