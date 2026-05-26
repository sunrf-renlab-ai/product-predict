# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/06-silent-form/site/
# generated: 2026-05-26T06:09:41.883Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 15 experience observations across 4 agents · 106 events
- Predicted NPS: -6 (achievable: 100)
- Task success: 25% · Rage clicks: 6 · Delights: 0
- Sessions: 2 frustrated, 1 timeout, 1 explored
- Cost: $0.00 (607,330 in / 11,245 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 表单提交后无任何反馈（成功/失败/清空）
SCALE: 1/4 agents felt this · 1 events · where: 填写完所有字段（姓名、邮箱、公司、主题、留言），点击提交按钮后
QUOTE (李心怡, 市场总监): "提交了，什么都没发生？成功了吗？失败了？页面纹丝不动。不知道该不该再点一次，怕重复提交。这种'静默'让我很慌。"

### [i02] HIGH · 情感氛围 — 静默设计让我对信息是否发出完全没底
SCALE: 1/4 agents felt this · 2 events · where: 提交按钮点击后，页面没有任何变化
QUOTE (李心怡, 市场总监): "静默表单？提交后什么反馈都没有，连个'提交成功'都没有？表单也没清空。我现在完全不知道我的信息到底发出去没有。太让人不安了，这种设计绝对不行。"

### [i04] HIGH · 功能契合 — 表单字段状态错乱：输入内容出现在错误的字段
SCALE: 1/4 agents felt this · 3 events · where: 在联系表单页面按Tab顺序填 firstName → lastName → email
QUOTE (Kenji Okada, 全栈工程师): "表白的firstName显示Okada，lastName显示kenji@example.com，email字段却是空的。Tab切换后数据就乱套了。"

### [i05] HIGH · 流程顺畅 — type_text覆盖逻辑异常：选中清空再输入仍显示旧数据
SCALE: 1/4 agents felt this · 3 events · where: 尝试用Meta+A全选后再输入新内容替换
QUOTE (Kenji Okada, 全栈工程师): "Triple click选中+Cmd+A选中+重新输入，结果lastName还是显示旧内容。这个表单的响应逻辑有问题。"

### [i08] HIGH · 功能契合 — 提交按钮点了毫无反应，没有成功/失败提示
SCALE: 1/4 agents felt this · 2 events · where: 在表单底部填完内容点击提交按钮
QUOTE (王磊, 创业者): "卧槽？！点了提交，什么都没发生。加载没、提示没、成功失败都不告诉用户。这就是'Silent Form'的意思？静默到让用户抓狂。"

### [i09] HIGH · 视觉节奏 — message textarea 高度只有40px，小到无法正常使用
SCALE: 1/4 agents felt this · 1 events · where: 在选择主题后填写技术问题内容
QUOTE (王磊, 创业者): "40px 高的 textarea 也太 mini 了，谁能在这么小的地方写东西？"

### [i10] HIGH · 流程顺畅 — Tab 焦点跳到 message 时，光标实际进了公司字段
SCALE: 1/4 agents felt this · 1 events · where: 在「选择主题」后按 Tab 跳到 message 字段时
QUOTE (王磊, 创业者): "文字填到公司名里去了？！光标跳错地方了。"

### [i12] HIGH · 流程顺畅 — 提交表单后无任何视觉反馈
SCALE: 1/4 agents felt this · 2 events · where: Contact Form页面，填写完所有字段后点击Submit
QUOTE (Maya Chen, 产品经理): "我点了提交，但什么都没发生——没有加载指示器，没有成功提示，没有页面跳转。"

### [i13] HIGH · 流程顺畅 — 无法确认消息是否已送达
SCALE: 1/4 agents felt this · 2 events · where: Contact Form页面提交后等待反馈
QUOTE (Maya Chen, 产品经理): "我没有任何确认我的询问已发送的迹象，不知道表单是不是坏了，没有理由相信这个产品会可靠地处理我的数据。"

### [i15] HIGH · 情感氛围 — Silent表单概念对用户是负体验
SCALE: 1/4 agents felt this · 2 events · where: 点击Submit后没有任何反应时的感受
QUOTE (Maya Chen, 产品经理): "'Silent'对开发者来说是功能，但对联系表单来说是糟糕的UX选择。我没有确认任何事情发生了的理由。"

### [i03] MED · 信息架构 — 顶部导航 Product 点击无反应
SCALE: 1/4 agents felt this · 1 events · where: 首页顶部导航栏
QUOTE (李心怡, 市场总监): "点击 Product 没反应？页面没变化。"

### [i06] MED · 流程顺畅 — 表单没有实时验证反馈：错误数据一直显示不报错
SCALE: 1/4 agents felt this · 2 events · where: 修复字段内容过程中看不到任何反馈
QUOTE (Kenji Okada, 全栈工程师): "看着字段里显示错误的数据，不知道是输入有问题还是表单本身坏了。没有红色警告，没有错误提示，就让我看着错误数据发呆。"

### [i07] MED · 可访问性 — Tab焦点与输入焦点不同步导致输入错位
SCALE: 1/4 agents felt this · 2 events · where: 连续按Tab切换字段时输入内容写错位置
QUOTE (Kenji Okada, 全栈工程师): "我用Tab跳到下一个字段，但光标可能还在上一个字段里，导致我的输入写到错误的地方了。"

### [i11] MED · 流程顺畅 — meta+a 全选公司字段后，输入没有替换原有内容
SCALE: 1/4 agents felt this · 1 events · where: 修复被误填的公司字段时
QUOTE (王磊, 创业者): "全选公司字段内容后再输入，新内容没替换掉旧的，还得手动清。"

### [i14] MED · 可访问性 — Topic下拉菜单交互不明确
SCALE: 1/4 agents felt this · 3 events · where: 尝试在Topic下拉菜单中选择Technical question
QUOTE (Maya Chen, 产品经理): "下拉菜单似乎卡在默认状态。我试了用键盘导航、输入搜索，但都没用。原生select元素有时候很难处理。"

## DELIGHTS
- **表单字段和布局跟腾讯文档很像，上手没门槛** (1× · 李心怡): "看起来是个联系表单，有姓名、邮箱、公司、主题下拉和留言。腾讯文档的表单也长这样，挺熟悉的。"
- **表单设计简洁，字段布局清晰** (1× · Kenji Okada): "至少视觉上看起来是一个正规的联系表单，topic选择的下拉也是我熟悉的模式。"
- **Tab 焦点顺序整体是对的，名字→姓→邮箱→公司→主题→message** (1× · 王磊): "光标跳到message了，这个表单体验还不错，起码Tab键跳顺序是对的。"
- **键盘选择下拉菜单用方向键+回车，符合习惯** (1× · 王磊): "选个主题，用键盘选，ArrowDown+Enter 这种操作我熟。"
- **表单布局干净利落** (1× · Maya Chen): "看起来挺干净的。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写联系表单 | 100% (4/4) | 75% | -1.3 | 11 |
| 提交表单 | 75% (3/4) | 33% | -3.0 | 5 |
| 修复合并字段 | 25% (1/4) | 0% | -3.0 | 4 |
| 选择topic下拉 | 25% (1/4) | 0% | -1.0 | 2 |
| Topic下拉选择 | 25% (1/4) | 0% | -2.0 | 2 |
| 主题选择 | 25% (1/4) | 100% | +1.0 | 1 |

## EXIT REASONS
- 李心怡: frustrated (141s)
- Kenji Okada: timeout (192s)
- 王磊: explored (211s)
- Maya Chen: frustrated (216s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/06-silent-form/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 14, Rage clicks ≤ 4.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
10 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/06-silent-form/site/ --compare run-001` and stop if it regresses.
```