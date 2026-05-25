# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/18-no-keyboard/site/
# generated: 2026-05-25T11:37:33.455Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 11 experience observations across 4 agents · 41 events
- Predicted NPS: -3 (achievable: 100)
- Task success: 0% · Rage clicks: 1 · Delights: 0
- Sessions: 1 frustrated, 1 explored, 2 timeout
- Cost: $0.00 (126,634 in / 5,548 out)

## OBSERVATIONS

### [i01] HIGH · 可访问性 — Tab键导航失效，键盘党寸步难行
SCALE: 1/4 agents felt this · 1 events · where: 在页面任意位置尝试Tab键
QUOTE (Maya Chen, 产品经理): "URL里特意写no-keyboard，是故意气我的吗？Tab键按了完全没反应，连基本键盘导航都没有"

### [i02] HIGH · 信息架构 — 页面几乎是空的，不知道能做什么
SCALE: 1/4 agents felt this · 1 events · where: 打开页面后查看整体布局
QUOTE (Maya Chen, 产品经理): "这页面就一个标题框，下面什么内容都没有，我该从哪里开始？"

### [i04] HIGH · 信息架构 — 首页没有任何产品标识或说明
SCALE: 1/4 agents felt this · 1 events · where: 刚进入页面时
QUOTE (李心怡, 内容运营): "这就是个空页面啊，我连它是做什么的都不知道，连个logo或产品名都没有。"

### [i05] HIGH · 流程顺畅 — 输入框里打字没有反馈，不知道能不能用
SCALE: 1/4 agents felt this · 2 events · where: 在输入框里尝试打字时
QUOTE (李心怡, 内容运营): "我输入了'测试标题'，但完全没看到光标变化或任何提示，这让我很慌，不确定内容保存了没有。"

### [i06] HIGH · 功能契合 — Tab和回车没有任何作用，不知道能干啥
SCALE: 1/4 agents felt this · 2 events · where: 按Tab和回车快捷键时
QUOTE (李心怡, 内容运营): "我按了Tab想看看会不会跳到下一个输入框，结果毛反应都没有。这产品到底能干嘛？"

### [i07] HIGH · 信息架构 — 内容输入区不好点，不知道是不是我没找对地方
SCALE: 1/4 agents felt this · 3 events · where: 输入完标题后，想点击下方"内容"区域输入正文，但三次点击都没成功进入输入状态
QUOTE (王磊, 独立顾问): "下方有一个"内容"区域，还有placeholder"输入内容"。看起来是双栏布局——左侧标题，右侧内容？或者只是垂直排列？让我试试输入内容。点击内容区域开始输入……点击内容输入框……点击内容输入框。怎么老是点不进去？"

### [i08] HIGH · 功能契合 — 不知道笔记存到哪里了，没安全感
SCALE: 1/4 agents felt this · 2 events · where: 刚输入完标题后，立刻产生的顾虑
QUOTE (王磊, 独立顾问): "标题输入成功了，界面很干净。但我有点担心——我的内容存在哪里？有没有自动保存？这个笔记会丢吗？"

### [i09] HIGH · 性能感知 — 初次加载只显示标题框，让用户以为页面坏了
SCALE: 1/4 agents felt this · 5 events · where: 进入页面后 3-4 秒内，页面主要内容（AI 对话界面）还没渲染出来，只显示了一个空的标题框
QUOTE (Kenji Okada, 全栈工程师): "页面看起来就只有一个标题输入框，没有其他内容。这是什么？一个空白的笔记？让我看看底部有什么。"

### [i03] MED · 与竞品对比 — 连Notion最基础的体验都差太远
SCALE: 1/4 agents felt this · 1 events · where: 与日常使用的Notion对比
QUOTE (Maya Chen, 产品经理): "每天用Notion，那种输入框直接出内容的流畅感完全没有，这连个半成品都不算"

### [i10] MED · 信息架构 — 「18-no-keyboard」这个名字没在产品里体现出来
SCALE: 1/4 agents felt this · 2 events · where: URL 里有「18-no-keyboard」，用户带着这个预期进来，但进来后没看到任何相关的功能体现
QUOTE (Kenji Okada, 全栈工程师): "我猜测这是一个尝试「无键盘」输入方式的工具——可能通过语音或者手势。但目前看来只有一个标题输入框，其他什么都没有。"

### [i11] MED · 流程顺畅 — 还没来得及真正使用产品就超时了
SCALE: 1/4 agents felt this · 1 events · where: 好不容易界面加载出来，正准备输入第一个问题探索产品能力，就被强制结束
QUOTE (Kenji Okada, 全栈工程师): "点击输入框准备提问……然后就没了。"

## DELIGHTS
- **界面简洁，没有乱七八糟的东西** (1× · 王磊): "页面看起来是一个简洁的写作界面，有标题输入框。这和Evernote有点像，但更简洁。"
- **能正常输入标题，体验顺畅** (1× · 王磊): "标题输入成功了，界面很干净。"
- **Tab 切换出隐藏界面那一瞬间有点惊喜** (1× · Kenji Okada): "哦！页面终于加载出来了——原来是一个 AI 对话界面！底部有输入框，标题是 MiniMax-M2.7。前面那些截图可能是占位图，还没加载完。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 标题输入 | 50% (2/4) | 50% | -0.5 | 3 |
| 输入笔记内容 | 25% (1/4) | 0% | -2.0 | 3 |
| 创建笔记标题 | 25% (1/4) | 100% | +2.0 | 2 |
| 触发内容加载 | 25% (1/4) | 0% | -1.0 | 2 |
| AI 对话输入 | 25% (1/4) | 0% | +0.0 | 2 |
| 键盘导航 | 25% (1/4) | 0% | -3.0 | 1 |
| 查看首页 | 25% (1/4) | 100% | -3.0 | 1 |
| 编辑标题 | 25% (1/4) | 0% | -2.0 | 1 |

## EXIT REASONS
- Maya Chen: frustrated (60s)
- 李心怡: explored (80s)
- 王磊: timeout (94s)
- Kenji Okada: timeout (121s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/18-no-keyboard/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 17, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
8 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/18-no-keyboard/site/ --compare run-001` and stop if it regresses.
```