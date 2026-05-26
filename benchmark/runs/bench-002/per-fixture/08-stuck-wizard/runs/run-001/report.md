# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/08-stuck-wizard/site/
# generated: 2026-05-26T02:46:00.079Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 54 events
- Predicted NPS: -9 (achievable: 75)
- Task success: 25% · Rage clicks: 3 · Delights: 0
- Sessions: 2 explored, 1 frustrated, 1 timeout
- Cost: $0.00 (248,495 in / 8,152 out)

## OBSERVATIONS

### [i01] HIGH · 学习成本 — 第一步输入框完全没提示
SCALE: 1/4 agents felt this · 2 events · where: 进入第一步页面
QUOTE (Emily Zhang, 市场营销专员): "输入框+Next按钮，完了？连个提示都没有？我又不是读心大师，谁知道要填什么！"

### [i02] HIGH · 信息架构 — 第二步复选框全是裸元素
SCALE: 1/4 agents felt this · 2 events · where: 点击Next进入第二步
QUOTE (Emily Zhang, 市场营销专员): "5个复选框全选中了？但这选项是啥啊？？一个文字说明都没有，我连自己在选什么都不知道。"

### [i04] HIGH · 信息架构 — 5个checkbox没有任何文字说明，不知道是什么选项
SCALE: 1/4 agents felt this · 1 events · where: 在点击Next后出现的checkbox选择页面
QUOTE (李心怡, 运营专员): "出现了5个checkbox，但没有任何文字说明每个是什么选项。感觉莫名其妙，不知道该选什么。"

### [i06] HIGH · 学习成本 — 没有任何引导，不知道这个工具是做什么的
SCALE: 1/4 agents felt this · 3 events · where: 整个使用过程
QUOTE (李心怡, 运营专员): "页面完全没有说明，不知道这个工具是做什么的，也没有任何引导。作为真实用户，我找不到继续使用的理由。"

### [i09] HIGH · 功能契合 — 期望是拖拽建仪表盘，结果让我写SQL
SCALE: 1/4 agents felt this · 4 events · where: 输入 sales dashboard query 后被展示数据库连接表单
QUOTE (Kenji Okada, 软件工程师): "我就是想看看能不能快速生成一个销售仪表盘，结果被引导到写 SQL。这到底是 BI 工具还是 SQL 客户端啊？"

### [i10] HIGH · 信息架构 — 入口和实际功能完全对不上
SCALE: 1/4 agents felt this · 3 events · where: 第一步引导输入查询，第二步跳到数据库连接表单
QUOTE (Kenji Okada, 软件工程师): "我以为输入 'sales dashboard' 之后会得到一个现成的仪表盘，或者至少能看到一些推荐的可视化模板。"

### [i03] MED · 与竞品对比 — 和现代工具的引导体验差太远
SCALE: 1/4 agents felt this · 1 events · where: 整体体验
QUOTE (Emily Zhang, 市场营销专员): "跟现在那些流畅的界面差太多了。用惯了Hootsuite那种有清晰指引的工具，这种'裸奔'界面完全没法用。"

### [i05] MED · 功能契合 — 点击checkbox完全没有任何反馈，不知道有没有选成功
SCALE: 1/4 agents felt this · 1 events · where: 尝试点击第一个checkbox
QUOTE (李心怡, 运营专员): "点击了第一个checkbox没有任何反应，页面上也没有任何说明。这完全不知道在做什么。"

### [i07] MED · 表达文案 — 错误提示是技术语言，看不懂
SCALE: 1/4 agents felt this · 4 events · where: 在向导的多个步骤点击Next时
QUOTE (Maya Chen, 产品经理): "expected number, got undefined — 这是啥？我是不是做错什么了？要不要重填？"

### [i11] MED · 与竞品对比 — 跟Tableau比，这个流程反人类
SCALE: 1/4 agents felt this · 2 events · where: 填写数据库连接信息阶段
QUOTE (Kenji Okada, 软件工程师): "Tableau 会先让你连接数据源，然后图形化地拖拽字段。这个向导倒好，让我直接写原始 SQL query。"

### [i08] LOW · 反馈感知 — 下拉选择后没反应，以为没选上
SCALE: 1/4 agents felt this · 1 events · where: 点击下拉框并选择选项后
QUOTE (Maya Chen, 产品经理): "我选了storage tier，但没看到明显反馈，不知道选没选成功"

## DELIGHTS
- **向导节奏适中，步骤清晰** (1× · Maya Chen): "每个页面一件事，不会一下子给我太多信息，挺好的"
- **结尾成功页让人有成就感** (1× · Maya Chen): "Finish之后看到完成提示，觉得自己搞定了，挺满足的"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 输入自然语言查询 | 25% (1/4) | 100% | -2.0 | 3 |
| 填写数据库连接表单 | 25% (1/4) | 0% | -3.0 | 3 |
| 填写表单 | 25% (1/4) | 100% | +0.0 | 2 |
| Wizard第一步 | 25% (1/4) | 0% | -3.0 | 1 |
| Wizard第二步 | 25% (1/4) | 0% | -3.0 | 1 |
| 文字输入 | 25% (1/4) | 100% | +0.0 | 1 |
| 进入下一步 | 25% (1/4) | 100% | -1.0 | 1 |
| 选择选项 | 25% (1/4) | 0% | -2.0 | 1 |
| 输入文本 | 25% (1/4) | 100% | +1.0 | 1 |
| 选择复选框 | 25% (1/4) | 100% | +0.0 | 1 |
| 下拉选择 | 25% (1/4) | 100% | +0.0 | 1 |
| 完成向导 | 25% (1/4) | 100% | +2.0 | 1 |
| 切换选项卡/步骤 | 25% (1/4) | 0% | -1.0 | 1 |

## EXIT REASONS
- Emily Zhang: explored (47s)
- 李心怡: frustrated (47s)
- Maya Chen: explored (85s)
- Kenji Okada: timeout (139s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/08-stuck-wizard/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 11, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
6 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/08-stuck-wizard/site/ --compare run-001` and stop if it regresses.
```