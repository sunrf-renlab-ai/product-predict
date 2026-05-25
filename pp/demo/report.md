# Product Predict / run-demo / Experience Notes
# target: https://cadence.app
# generated: 2026-05-25T03:19:08.000Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of synthetic users *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 9 experience observations across 6 agents · 37 events
- Predicted NPS: 14 (achievable: 58)
- Task success: 33% · Rage clicks: 3 · Delights: 6
- Sessions: 2 accomplished, 1 explored, 3 frustrated
- Cost: $0.00 (218,430 in / 8,920 out)

## OBSERVATIONS

### [i01] HIGH · 学习成本 — 4 人小团队的 onboarding 概念太多
SCALE: 1/6 agents felt this · 3 events · where: onboarding 流程 / 注册到第一次 standup
QUOTE (Lars Hjelm, 创业者): "已经 7 步了团队人还没回答一个问题. 概念叠概念, 不是给 4 人小队设计"

### [i02] HIGH · 信息架构 — 导出 PDF 功能缺失 + 入口三层深
SCALE: 1/6 agents felt this · 2 events · where: 试图导出每周报告给老板
QUOTE (王磊, 项目经理): "导出按钮藏在 Settings → Reports → Weekly Digest 三层深, 而且没有 PDF 选项. 老板会让我自己转?"

### [i03] HIGH · 功能契合 — 模板编辑器只能改问题文字, 没有字段类型
SCALE: 1/6 agents felt this · 1 events · where: PM 配置团队 standup 模板
QUOTE (Maya Chen, 产品经理): "想把'是否有阻塞项'设成必填字段, 但模板编辑器只能改问题文字, 没有字段类型选项"

### [i04] HIGH · 功能契合 — Slack 集成不支持多 workspace
SCALE: 1/6 agents felt this · 1 events · where: 跨多个 Slack workspace 的团队接入
QUOTE (Aiko Tanaka, 运营经理): "Slack 集成是 1 个 Cadence ↔ 1 个 workspace, 团队同时用 2 个 workspace 的 channels, 都接进来发现不行"

### [i05] MED · 与竞品对比 — 无 webhook 接收 standup answer, 阻塞 CI 集成
SCALE: 1/6 agents felt this · 1 events · where: 工程主管评估自动化集成深度
QUOTE (Kenji Okada, 工程主管): "API 文档只有 REST 调用, 没找到 webhook 接收 standup answer, 想接 CI 还差关键一环"

### [i06] MED · 表达文案 — 日语界面只翻译 60%, 关键名词仍是英文
SCALE: 1/6 agents felt this · 1 events · where: 多语言团队切换界面语言
QUOTE (Aiko Tanaka, 运营经理): "日语只翻译 60% 左右, 关键的'回答模板' / '提醒规则'还是英文. 日本同事会看不懂"

### [i07] MED · 可访问性 — 暗色模式下未读红点对比度只有 2:1
SCALE: 1/6 agents felt this · 1 events · where: 切换主题后注意到通知样式
QUOTE (Sofia Reyes, 设计师): "暗色模式整体不错, 但「未读红点」在暗背景下对比度只有 2:1, 几乎看不见"

### [i08] LOW · 视觉节奏 — 落地页对小团队信息密度过高
SCALE: 1/6 agents felt this · 2 events · where: 落地页首屏扫描
QUOTE (Lars Hjelm, 创业者): "首屏列出 11 个 feature, 信息量大, 不像是给小团队设计"

### [i09] LOW · 学习成本 — 'team' + 'cadence' 双层概念让新人卡住
SCALE: 1/6 agents felt this · 1 events · where: 首次创建第一个 standup
QUOTE (Lars Hjelm, 创业者): "需要先建 'team', 然后建 'cadence' (是个啥概念?), 然后再加 questions, 然后 invite"

## DELIGHTS
- **节奏可视化图一眼识别躺平的人** (1× · Maya Chen): "节奏可视化图能一眼看出谁连续 3 天没回应, 这才是 PM 真正需要的"
- **每人独立时区 + 工作时段, 按本地时间发提醒** (1× · Aiko Tanaka): "每个人能单独设时区 + 工作时段, 提醒按本地时间发, 我团队 4 时区有救"
- **Cmd+K 命令面板 + Markdown 实时渲染** (2× · Kenji Okada): "在回答里打 markdown, > blockquote / **bold** / `code` 都实时渲染"
- **微交互用 spring 动画, 不是敷衍 fade** (1× · Sofia Reyes): "hover 状态都有 spring 动画, 不是敷衍的 0.2s fade"
- **落地页 3 秒能看懂价值主张** (1× · Maya Chen): "落地页清爽, 3 秒能看出是异步 standup 工具"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| 查看落地页演示 | 100% (6/6) | 100% | +0.8 | 6 |
| 创建 team & cadence | 33% (2/6) | 50% | -1.5 | 4 |
| 编辑问题模板 | 17% (1/6) | 0% | -1.0 | 2 |
| 命令面板 (Cmd+K) | 17% (1/6) | 100% | +2.0 | 1 |
| 时区/工作时段设置 | 17% (1/6) | 100% | +3.0 | 1 |
| 切换主题/语言 | 33% (2/6) | 100% | +0.5 | 2 |
| 集成 (Slack/GitHub) | 33% (2/6) | 0% | -2.0 | 3 |
| 导出报告 | 17% (1/6) | 0% | -2.0 | 2 |

## EXIT REASONS
- Maya Chen: accomplished (135s)
- Kenji Okada: explored (204s)
- 王磊: frustrated (189s)
- Sofia Reyes: accomplished (185s)
- Aiko Tanaka: frustrated (308s)
- Lars Hjelm: frustrated (178s)

## VERIFICATION
After applying fixes, re-run:
```
pp run https://cadence.app --agents 6 --compare run-demo
```
Pass criteria: NPS ≥ 34, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-demo) — 6 synthetic users tried it for real.
4 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run https://cadence.app --compare run-demo` and stop if it regresses.
```