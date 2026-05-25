# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/03-heavy-signup/site/
# generated: 2026-05-25T11:20:01.814Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 8 experience observations across 4 agents · 48 events
- Predicted NPS: -8 (achievable: 76)
- Task success: 0% · Rage clicks: 3 · Delights: 0
- Sessions: 1 explored, 2 timeout, 1 frustrated
- Cost: $0.00 (179,932 in / 5,109 out)

## OBSERVATIONS

### [i01] HIGH · 流程顺畅 — 注册字段太多，还没进门就劝退了
SCALE: 1/4 agents felt this · 3 events · where: 进入 localhost:8200/03-heavy-signup/site/ 后看到完整注册表单
QUOTE (Maya Chen, 产品经理): "注册个账号要填8个字段？还要求Work email、Phone、Company size... 我只是想用个产品又不是在办信用卡"

### [i02] HIGH · 情感氛围 — 要求工作邮箱和电话，感觉被过度索取隐私
SCALE: 1/4 agents felt this · 2 events · where: 注意到表单中email和phone栏的标注文字
QUOTE (Maya Chen, 产品经理): "Work email和phone for verification的标注让我感觉被过度询问隐私信息"

### [i04] HIGH · 流程顺畅 — 注册字段太多，门槛高到让我想关掉
SCALE: 1/4 agents felt this · 3 events · where: 进入注册页，看到8个字段需要填写，还没看到产品就感到压力
QUOTE (Maya Chen, 产品经理): "电话和密码都要在第一页填？我还没看到产品长什么样呢"

### [i05] HIGH · 情感氛围 — 表单把用户当'潜在客户'而不是'想试试的人'
SCALE: 1/4 agents felt this · 2 events · where: 填完名字和邮箱后意识到还有5个字段要填
QUOTE (Maya Chen, 产品经理): "这感觉像是在被销售追着填信息，不是我喜欢的 self-serve 方式"

### [i07] HIGH · 信息架构 — 注册页没有产品名称，像在填黑盒表单
SCALE: 1/4 agents felt this · 1 events · where: 进入注册页的第一步
QUOTE (李心怡, HR 主管): "页面好像没有产品名称或logo，就直接是注册表单。我不太清楚这是做什么的，但既然看到了就随便填填试试吧。"

### [i08] HIGH · 流程顺畅 — 填到一半被强制中断，步骤限制让人很烦躁
SCALE: 1/4 agents felt this · 1 events · where: 填写职位信息时
QUOTE (李心怡, HR 主管): "达到 step safety 上限 (15), 强制结束。"

### [i03] MED · 与竞品对比 — 跟竞品Linear比，注册摩擦差距太大
SCALE: 1/4 agents felt this · 1 events · where: 整个注册流程浏览过程中在心里与Linear比较
QUOTE (Maya Chen, 产品经理): "跟Linear那种一个邮箱就搞定比起来差太远了，我現在就已經想關掉走人了"

### [i06] MED · 信息架构 — 页面顶部看不清，不知道这个产品是做什么的
SCALE: 1/4 agents felt this · 1 events · where: 进入页面后想先了解产品，但页面初始视图被表单占据
QUOTE (Maya Chen, 产品经理): "连 logo 和 header 都看不到，我连这是什么东西都不确定"

## DELIGHTS
- **Tab 键能正常跳转下一个字段** (1× · Maya Chen): "还好键盘导航是顺的，不然更烦躁"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写注册表单 | 25% (1/4) | 0% | -3.0 | 3 |
| 注册/登录 | 25% (1/4) | 0% | -3.0 | 1 |
| 注册表单填写 | 25% (1/4) | 0% | -2.0 | 1 |

## EXIT REASONS
- Maya Chen: explored (28s)
- Kenji Okada: timeout (89s)
- Maya Chen: frustrated (98s)
- 李心怡: timeout (109s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/03-heavy-signup/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 12, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
6 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/03-heavy-signup/site/ --compare run-001` and stop if it regresses.
```