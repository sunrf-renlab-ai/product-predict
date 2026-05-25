# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/06-silent-form/site/
# generated: 2026-05-25T11:23:13.913Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 10 experience observations across 4 agents · 62 events
- Predicted NPS: -7 (achievable: 77)
- Task success: 0% · Rage clicks: 3 · Delights: 0
- Sessions: 4 timeout
- Cost: $0.00 (219,174 in / 6,126 out)

## OBSERVATIONS

### [i01] HIGH · 功能契合 — 表单输入交互混乱，数据乱跳
SCALE: 1/4 agents felt this · 2 events · where: 填写联系表单时
QUOTE (王磊, IT 运维): "什么情况？我输入的邮箱怎么跑到姓名字段里去了？Tab跳转出问题了？这个表单肯定有bug，我可不敢提交了。"

### [i02] HIGH · 功能契合 — 输入框不吃数据或吞内容
SCALE: 1/4 agents felt this · 3 events · where: 填写联系表单时反复尝试修复
QUOTE (王磊, IT 运维): "这表单完全坏了。输入的数据不知道去哪了，邮箱也填不上。名字也空了。彻底放弃了，输入框根本不吃东西，要么吞数据要么跳错位置。"

### [i03] HIGH · 情感氛围 — 不敢提交，怕信息错乱丢客户
SCALE: 1/4 agents felt this · 2 events · where: 多次尝试失败后的感受
QUOTE (王磊, IT 运维): "这种质量的东西让我很没安全感，不敢用也不敢提交。万一发出去信息全乱了，客户还以为我们不专业。走了。"

### [i04] HIGH · 信息架构 — 导航链接全挂了，直接断了我了解产品的路
SCALE: 1/4 agents felt this · 3 events · where: 首页 -> 点击 Product -> 点击 Pricing -> 都没反应
QUOTE (Maya Chen, 产品经理): "导航链接点了都没反应...这是静态页面吗？感觉这个网站还比较早期，连导航都没做好"

### [i08] HIGH · 信息架构 — 品牌/产品身份缺失，看完不知道这是谁
SCALE: 1/4 agents felt this · 1 events · where: 进入页面的第一秒
QUOTE (李心怡, 市场营销专员): "这公司干嘛的？我在给谁留信息？"

### [i10] HIGH · 流程顺畅 — 被强制踢出，连表单都没填完
SCALE: 1/4 agents felt this · 1 events · where: 表单填写中途
QUOTE (李心怡, 市场营销专员): "什么鬼，我还在填表单呢，直接给我弹出去了？"

### [i05] MED · 信息架构 — 光靠表单留不住用户，没导航等于没入口
SCALE: 1/4 agents felt this · 1 events · where: 表单填写前
QUOTE (Maya Chen, 产品经理): "我就算想填表单，还得先猜这个页面是干嘛的"

### [i06] MED · 信息架构 — 表单页面没有让我知道这个产品是什么
SCALE: 1/4 agents felt this · 1 events · where: 进入页面后，只看到表单，没有产品logo或主价值主张的露出
QUOTE (Kenji Okada, 前端工程师): "我只看到「Contact Sales」这个标题，但我不知道这家公司做的是哪个领域的 SaaS，对比 HubSpot 的时候我没法直接判断它跟我的需求对不对口。"

### [i09] MED · 功能契合 — 下拉菜单要操作两次才能选中一个选项
SCALE: 1/4 agents felt this · 3 events · where: topic 下拉菜单选择
QUOTE (李心怡, 市场营销专员): "点了一下没反应，又点了一下才出来，然后又选了一次才选中"

### [i07] LOW · 视觉节奏 — Topic 下拉菜单选完后没有明确提示当前选中的是哪个
SCALE: 1/4 agents felt this · 1 events · where: 打开 topic 下拉菜单，用键盘导航选中并按回车后
QUOTE (Kenji Okada, 前端工程师): "我用键盘敲了 Technical question，回车之后感觉选中了，但界面上没有给我一个很明确的反馈说「当前已选 Technical question」。我不是特别确定到底选中没有。"

## DELIGHTS
- **表单字段布局清晰，填起来不费劲** (1× · Maya Chen): "试试这个表单能不能正常工作"
- **表单能正常使用，没崩溃** (1× · Maya Chen): "感觉这个网站还比较早期，连导航都没做好。不过看起来是个联系表单，我试试能不能正常使用"
- **表单字段顺序符合直觉，Tab 键顺序流畅** (1× · Kenji Okada): "在几个字段间切换的时候很顺手，没有跳来跳去的感觉——这比 HubSpot 某些嵌入式表单要自然。"
- **下拉菜单支持键盘操作（方向键+回车），加分** (1× · Kenji Okada): "我不喜欢每次都要去点鼠标，这种键盘优先的设计让我觉得这个产品可能对技术用户友好。"
- **表单字段不多，操作节奏还行** (1× · 李心怡): "字段看起来都是我熟悉的，填起来不费脑子"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写联系表单 | 75% (3/4) | 0% | -0.7 | 6 |
| 导航功能 | 25% (1/4) | 0% | -2.0 | 3 |
| 切换 topic 下拉选项 | 25% (1/4) | 100% | +1.0 | 1 |
| 联系表单 | 25% (1/4) | 0% | -1.0 | 1 |

## EXIT REASONS
- 王磊: timeout (87s)
- Maya Chen: timeout (96s)
- Kenji Okada: timeout (115s)
- 李心怡: timeout (129s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/06-silent-form/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 13, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
6 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/06-silent-form/site/ --compare run-001` and stop if it regresses.
```