# Product Predict / run-001 / Experience Notes
# target: http://localhost:8200/16-placeholder-label/site/
# generated: 2026-05-25T11:34:48.416Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 8 experience observations across 4 agents · 54 events
- Predicted NPS: -3 (achievable: 53)
- Task success: 25% · Rage clicks: 1 · Delights: 0
- Sessions: 1 explored, 2 timeout, 1 frustrated
- Cost: $0.00 (185,989 in / 5,161 out)

## OBSERVATIONS

### [i02] HIGH · 流程顺畅 — 填完时区就超时了，根本没机会点发送
SCALE: 1/4 agents felt this · 1 events · where: 填写完时区字段后达到步骤上限，表单无法提交
QUOTE (Maya Chen, 产品经理): "我都填完了，结果给我卡在这里？连发送按钮都没摸到呢。"

### [i04] HIGH · 信息架构 — 下拉菜单操作卡壳，不知道要滑下去
SCALE: 1/4 agents felt this · 2 events · where: 填写角色/Role字段时，点击下拉菜单没有展开选项
QUOTE (Kenji Okada, 研发主管): "这个下拉框点了两下怎么没反应？我还以为是控件坏了"

### [i05] HIGH · 流程顺畅 — 填到一半被踢出去，挫败感很强
SCALE: 1/4 agents felt this · 1 events · where: 第15步操作后被强制结束，没有机会提交
QUOTE (Kenji Okada, 研发主管): "什么鬼，15步就把我踢了？我还没填完呢"

### [i07] HIGH · 功能契合 — 角色权限下拉框点击完全无响应
SCALE: 1/4 agents felt this · 1 events · where: 在填写表单时尝试选择角色权限
QUOTE (王磊, 运营经理): "下拉框完全没反应！点了好几次什么都不发生。这在正式产品里是不可接受的bug。"

### [i01] MED · 视觉节奏 — 下拉框并排容易看错行
SCALE: 1/4 agents felt this · 1 events · where: 在填写表单的页面，Job Title和Member角色两个下拉框并排显示
QUOTE (李心怡, HR专员): "作为HR我会担心填表的人会不会看错行"

### [i03] MED · 性能感知 — 时区搜索打字后等好久才出结果
SCALE: 1/4 agents felt this · 1 events · where: 在时区字段输入 PST
QUOTE (Maya Chen, 产品经理): "打个 PST 怎么这么慢才出结果，感觉卡了一下。"

### [i06] MED · 视觉节奏 — 表单字段太多，看不到进度
SCALE: 1/4 agents felt this · 1 events · where: 整个表单填写过程中
QUOTE (Kenji Okada, 研发主管): "这么多字段要填，什么时候是个头啊"

### [i08] LOW · 情感氛围 — 看到外部图片域名会担心数据安全
SCALE: 1/4 agents felt this · 1 events · where: 刚进入表单页面时
QUOTE (王磊, 运营经理): "有个外部图片链接(oss-cn-wulanchabu)，下意识有点在意数据安全。"

## DELIGHTS
- **placeholder示例写法清晰** (1× · 李心怡): "邮箱和时区字段用了'e.g.'示例，一看就懂"
- **输入时placeholder消失流畅** (1× · 李心怡): "点进去placeholder正常消失，体验OK"
- **表单字段很全，有职位、角色、部门这些我关心的** (1× · Maya Chen): "比起有些工具只给个邮箱就行，这种详细字段让我觉得这是个正经管理团队的地方。"
- **表单输入体验流畅** (1× · Kenji Okada): "填名字和邮箱倒是挺顺的，光标定位准确"
- **界面简洁不花哨** (1× · Kenji Okada): "看着挺干净的，没有乱七八糟的东西"
- **表单布局清晰，字段分类明确** (1× · 王磊): "布局看起来挺清晰的，字段分类明确。"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 填写邀请表单 | 50% (2/4) | 50% | +0.0 | 5 |
| 填写文本字段 | 25% (1/4) | 0% | +2.0 | 6 |
| 填写表单字段 | 25% (1/4) | 100% | +2.0 | 3 |
| 选择角色权限 | 25% (1/4) | 0% | -3.0 | 3 |
| 选择下拉菜单 | 25% (1/4) | 0% | -2.0 | 2 |
| 提交表单 | 25% (1/4) | 0% | +0.0 | 1 |

## EXIT REASONS
- 李心怡: explored (65s)
- Maya Chen: timeout (98s)
- Kenji Okada: timeout (101s)
- 王磊: frustrated (115s)

## VERIFICATION
After applying fixes, re-run:
```
pp run http://localhost:8200/16-placeholder-label/site/ --agents 4 --compare run-001
```
Pass criteria: NPS ≥ 17, Rage clicks ≤ 0.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-001) — 4 synthetic users tried it for real.
4 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run http://localhost:8200/16-placeholder-label/site/ --compare run-001` and stop if it regresses.
```