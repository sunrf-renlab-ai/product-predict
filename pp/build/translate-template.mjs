// One-shot: translate the Chinese UI strings baked into the report viewer
// bundle (pp/src/templates/report.html) to English.
//
// The bundle is minified; CJK is \u-escaped. We (1) decode CJK-range \u and
// non-ASCII \x escapes into real characters, (2) literal-replace each Chinese
// phrase with its English equivalent, (3) write back as UTF-8.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(here, "../src/templates/report.html");

// Decode \uXXXX (codepoint >= 0x2000: punctuation + CJK) and \xXX (>= 0x80)
// into real characters. ASCII-range escapes are left untouched.
function decodeNonAscii(s) {
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => {
    const cp = parseInt(h, 16);
    return cp >= 0x2000 ? String.fromCharCode(cp) : m;
  });
  s = s.replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => {
    const cp = parseInt(h, 16);
    return cp >= 0x80 ? String.fromCharCode(cp) : m;
  });
  return s;
}

// Chinese → English. Order matters: longer / more-specific strings first so
// they're replaced before their substrings.
const MAP = [
  // landing / hero
  ["扔一个 git 仓库进来。我们用一组合成用户在沙盒里运行它， 收集犹豫、误点、抱怨、惊喜。", "Drop in a git repo. We run a population of AI agents on it in a sandbox, collecting hesitation, misclicks, complaints, and delight."],
  [" 后给你一份带证据链的反馈报告。", " Then we hand you a feedback report with an evidence trail."],
  ["压缩到 ", "down to "],
  ["这件事", ""],
  ["三分钟", "three minutes"],
  ["把 ", "Compress "],
  ["内测", "beta testing"],
  // source panel
  ["Source · 把代码喂给我们", "Source · feed us your code"],
  ["云端拉取", "Pull from cloud"],
  ["CLI · 本地", "CLI · local"],
  ["上传 zip", "Upload zip"],
  ["扫描中…", "Scanning…"],
  ["重新扫描", "Rescan"],
  ["扫描仓库", "Scan repo"],
  ["✓ 已授权 GitHub · @ari", "✓ GitHub authorized · @ari"],
  ["· 仓库须包含 package.json 或 Dockerfile", "· repo must contain package.json or Dockerfile"],
  ["拖入 .zip 或点击选择", "Drop a .zip or click to choose"],
  ["不上传 node_modules / .git / dist", "node_modules / .git / dist not uploaded"],
  // config
  ["团队待办 · 异步任务流", "Team todos · async task flow"],
  ["配置 Agent 面板", "Configure agent panel"],
  ["构造合成用户", "Build the agent population"],
  ["从你提供的真实内测数据中蒸馏画像；或使用我们的人群预设。每个 agent 有完整的认知模型与目标。", "Distill personas from your real beta data, or use our presets. Each agent has a full cognitive model and goals."],
  ["沙盒中运行产品", "Run the product in a sandbox"],
  ["在隔离的浏览器实例里部署你的 build。Agent 实际点击、输入、犹豫、抱怨，过程可回放。", "Deploys your build in an isolated browser instance. Agents actually click, type, hesitate, and complain — fully replayable."],
  ["证据链反馈", "Evidence-backed feedback"],
  ["不只是「用户觉得不好」，每条建议都附带触发事件、agent 引语、屏幕坐标与回放片段。", "Not just \"users didn't like it\" — every suggestion comes with the triggering event, an agent quote, screen coordinates, and a replay clip."],
  [" 命令将在你的 PATH 中可用。", " command will be available on your PATH."],
  ["安装后 ", "After install, the "],
  ["首次运行会让你在浏览器里授权账号。", "The first run asks you to authorize your account in the browser."],
  ["02 · 在项目目录里运行", "02 · run it in your project directory"],
  ["  ↳ 沙盒中部署本地 build · 24 agents 排队", "  ↳ deploys your local build in a sandbox · 24 agents queued"],
  ["  ↳ 实时面板: ", "  ↳ live panel: "],
  ["已检测到本机 pp · v0.4.2", "Detected local pp · v0.4.2"],
  ["挂载本地运行 →", "Mount local run →"],
  ["03 · 在 Claude Code / Cursor / Codex 里直接调用", "03 · call it directly from Claude Code / Cursor / Codex"],
  ["在对话里这样说", "Say this in the chat"],
  ["“帮我用 product-predict 跑一遍当前分支，", "\"Run product-predict on the current branch for me,"],
  ["用 24 个 agent 重点测 onboarding 流程，", "with 24 agents focused on the onboarding flow,"],
  ["拿到报告后直接修 high severity 的问题。”", "then fix the high-severity issues from the report.\""],
  ["→ Claude 调用 pp.run() → 等 ~3 分钟 → 拿到 AI 修复包 → 直接 apply", "→ Claude calls pp.run() → wait ~3 min → get an AI fix pack → apply it"],
  ["挑选要扔进沙盒的 ", "Pick the "],
  [" 位合成用户", " agents to drop into the sandbox"],
  ["清空选择", "Clear selection"],
  ["全选", "Select all"],
  ["每个 agent 有独立的目标、技术熟练度、注意力模型与情绪基线。 点击卡片切换是否参与；点头像可以预览画像。", "Each agent has its own goals, tech proficiency, attention model, and emotional baseline. Click a card to toggle participation; click an avatar to preview the persona."],
  ["人群预设", "Population preset"],
  ["12 个画像", "12 personas"],
  ["从内测数据生成", "Generated from beta data"],
  ["需 ≥50 真实用户", "needs ≥50 real users"],
  ["混合", "Mixed"],
  ["预设 + 数据", "preset + data"],
  ["目标：", "Goal: "],
  ["急躁", "impatient"],
  ["挑剔", "exacting"],
  ["定制 AGENT", "Custom agent"],
  ["Scenario · 测试场景", "Scenario · test scenario"],
  ["首次会话", "First session"],
  ["登录→空状态→创建第一个任务", "sign in → empty state → create first task"],
  ["日常使用", "Daily use"],
  ["多次进出，团队协作", "repeated visits, team collaboration"],
  ["高频任务", "High-frequency tasks"],
  ["100+ 任务的极端场景", "extreme scenario with 100+ tasks"],
  ["移动端", "Mobile"],
  ["模拟时长", "Sim duration"],
  ["每 agent 10 分钟", "10 min per agent"],
  ["并行实例", "Parallel instances"],
  ["情绪基线", "Emotional baseline"],
  ["多样化", "Varied"],
  ["预估用时", "Est. time"],
  ["预估成本", "Est. cost"],
  ["← 返回", "← back"],
  ["启动模拟", "Start simulation"],
  // agent panel
  ["Agent Panel · 这次 run 用的合成用户", "Agent Panel · agents for this run"],
  [" 个画像 · 总共 ", " personas · "],
  [" 个 agent 跑了一遍", " agents in total ran through it"],
  ["每个画像有自己的偏好和已知背景。多个 agent 共享同一画像时，他们都按这个偏好探索 —— 复制数由权重决定。 编辑 persona set: ", "Each persona has its own preferences and known context. When multiple agents share a persona, they all explore by those preferences — copy count is set by weight. Edit persona set: "],
  [" 个实例", " instances"],
  ["已知背景", "Known context"],
  ["Run #043 · 完成", "Run #043 · complete"],
  ["Run #043 · 模拟中", "Run #043 · simulating"],
  ["Run #043 · 已暂停", "Run #043 · paused"],
  ["暂停", "Pause"],
  ["继续", "Resume"],
  ["查看报告", "View report"],
  ["等待 agent 启动…", "Waiting for agents to start…"],
  ["Agents · 实时状态", "Agents · live status"],
  [" 位 agent 在后台运行", " agents running in the background"],
  ["已完成", "Done"],
  ["排队中", "Queued"],
  ["登录", "Sign in"],
  ["探索", "Explore"],
  ["创建任务", "Create task"],
  ["通知设置", "Notification settings"],
  ["邀请协作", "Invite collaborators"],
  ["导出数据", "Export data"],
  ["退出", "Exit"],
  ["运行中", "Running"],
  // agent inner-monologue samples
  ["「创建第一个任务」按钮在哪？", "Where's the \"create first task\" button?"],
  ["Cmd+K… 还是不行。", "Cmd+K… still nothing."],
  ["这个圆角不对劲。", "These corner radii feel off."],
  ["好顺的拖拽。", "Nice smooth drag."],
  ["键盘把输入框遮住了。", "The keyboard covers the input."],
  ["导出 CSV 在哪？", "Where's CSV export?"],
  ["整体节奏不错。", "Good overall pacing."],
  ["Tab → Enter，行云流水。", "Tab → Enter, totally fluid."],
  ["邮件摘要开关怎么这么深？", "Why is the email-digest toggle buried so deep?"],
  ["权限就两档？", "Only two permission levels?"],
  ["批量粘贴邮箱很爽。", "Bulk-pasting emails feels great."],
  ["模板太少了。", "Too few templates."],
  ["审核 PR #421", "Review PR #421"],
  ["对齐周一 standup 议程", "Align on Monday's standup agenda"],
  ["回 Lars 的合同邮件", "Reply to Lars's contract email"],
  ["Pebble onboarding 第二轮迭代", "Pebble onboarding, second iteration"],
  [" 正在探索…", " is exploring…"],
  ["空白页", "Blank page"],
  ["找通知", "Find notifications"],
  [" · 已完成 · 回放", " · done · replay"],
  ["没有事件。", "No events."],
  ["这位 agent 没有截图记录。", "This agent has no screenshots."],
  ["← 上一步", "← previous"],
  ["下一步 →", "next →"],
  ["Agents · 状态", "Agents · status"],
  ["崩溃", "Crashed"],
  ["超步", "Over step cap"],
  ["暂无数据", "No data yet"],
  // report header / views
  ["Report #043 · 两种视图", "Report #043 · two views"],
  ["给人看", "For humans"],
  ["叙事 · 引语 · 证据", "Narrative · quotes · evidence"],
  ["给 AI 看", "For AI"],
  ["结构化 · 可直接修复", "Structured · ready to fix"],
  ["24 位", "24"],
  [" 合成用户花了 4 小时 17 分用你的产品。", " agents ran your product."],
  ["这是他们的", "This is their"],
  ["未经粉饰", "unvarnished"],
  ["的反馈。", " feedback."],
  ["导出 PDF", "Export PDF"],
  ["同步到 Linear", "Sync to Linear"],
  ["修复后重跑", "Re-run after fixing"],
  ["可改进至 +28", "improvable to +28"],
  ["可改进至", "improvable to"],
  ["9 / 24 卡在新建任务", "9 / 24 stuck creating a task"],
  ["行业基准 1:20", "industry benchmark 1:20"],
  ["集中在「同步」按钮", "concentrated on the \"sync\" button"],
  ["拖拽 + 键盘流", "drag-and-drop + keyboard flow"],
  ["8 个问题 · 按严重度排序", "8 issues · sorted by severity"],
  [" · 回放 14s 片段 →", " · replay 14s clip →"],
  ["Evidence · 触发该问题的事件链", "Evidence · the event chain that triggered this issue"],
  ["→ 回放", "→ replay"],
  ["AI Suggestions · 改动建议", "AI Suggestions · proposed changes"],
  ["在空状态画面添加一个 100×100 的「+ 新任务」CTA，居中。", "Add a centered 100×100 \"+ New task\" CTA to the empty-state screen."],
  ["首次访问时弹出 3 步引导，引导用户创建第一个任务。", "Show a 3-step intro on first visit that guides the user to create their first task."],
  ["src/components/Onboarding.tsx · 新建", "src/components/Onboarding.tsx · new file"],
  ["重新设计 onboarding 流程，参考 Linear 的「示例项目」模式。", "Redesign the onboarding flow, modeled on Linear's \"sample project\" pattern."],
  ["多文件改动", "Multi-file change"],
  ["开 PR →", "Open PR →"],
  ["Delights · 用户喜欢的", "Delights · what users liked"],
  ["Route Heatmap · 路径热度", "Route Heatmap · path heat"],
  ["一份 ", "an "],
  ["可执行", "actionable"],
  [" 的修复包。", " fix pack."],
  ["这一份是给 Claude Code / Cursor / Codex 读的。把下面任一格式喂给它，它就能找到对应文件、按优先级落地修复，并在完成后调用 ", "This one is for Claude Code / Cursor / Codex. Feed it either format below and it can find the right files, land fixes by priority, and call "],
  [" 验证。", " to verify when done."],
  ["markdown · 推荐", "markdown · recommended"],
  ["粘到 chat 里", "Paste into chat"],
  ["新建 +89", "new +89"],
  ["新建 +42", "new +42"],
  ["新建", "new"],
  ["创建第一个任务", "Create first task"],
  ["拖到 Today 列", "Drag to the Today column"],
  ["邀请协作者", "Invite a collaborator"],
  ["新用户找不到「创建任务」入口", "New users can't find the \"create task\" entry"],
  ["当 tasks.length === 0 时渲染 EmptyState CTA", "Render an EmptyState CTA when tasks.length === 0"],
  ["Cmd+/ 应为 Cmd+K", "Cmd+/ should be Cmd+K"],
  ["缺少 CSV / API 导出", "Missing CSV / API export"],
  ["+ 新任务", "+ New task"],
  // report metrics block (what the demo actually shows)
  [" 合成用户花了 ", " agents spent "],
  [" 用你的产品。", " using your product."],
  ["这是他们对它的", "This is how they actually"],
  ["真实感受", "felt about it"],
  ["下载 report.md", "Download report.md"],
  ["查看 run.json", "View run.json"],
  ["首次惊喜很快", "First delight came quickly"],
  ["用户花了一段时间才感到价值", "Users took a while to feel the value"],
  ["没有 agent 报告问题。要么产品已经很好，要么 agent 都太宽容。", "No agent reported an issue. Either the product is already great, or the agents were too forgiving."],
  [" 事件", " events"],
  ["功能使用频率 · 这次会话里被真正使用的功能", "Feature usage · features actually used in this session"],
  ["完成率", "Completion rate"],
  ["尝试", "attempts"],
  ["没有亮点记录。值得反思。", "No delights recorded. Worth reflecting on."],
  ["没有同源跳转记录。", "No same-origin navigation recorded."],
  [" · 两种视图", " · two views"],
  ["这一份是给 Claude Code / Cursor / Codex 读的。把下面任一格式喂给它，它就能按优先级落地修复，并在完成后调用 ", "This one is for Claude Code / Cursor / Codex. Feed it either format below and it can land fixes by priority and call "],
  ["没有愤怒点击", "No rage clicks"],
  ["功能", "Feature"],
  ["感受", "feeling"],
  // sample issue titles + data labels seen in the prototype report
  ["渲染居中的", "render a centered"],
  ["搜索关键词", "search keyword"],
  ["命中", "hits"],
  ["权限粒度太粗", "Permission granularity too coarse"],
  ["深色模式次要按钮对比度", "Dark-mode secondary button contrast"],
  ["键盘遮挡输入区域", "Keyboard covers the input area"],
  ["按钮无加载态", "Button has no loading state"],
  ["模板太少且偏开发", "Too few templates, too dev-oriented"],
  ["条观察", " observations"],
  ["这是用户的", "This is the users'"],
  ["列表", "list"],
  ["首次在第", "first triggered at"],
  ["触发", ""],
  ["渲染居中", "render centered"],
  ["入口", "entry"],
  ["个浏览器", " browsers"],
  ["数据生成", "generated from data"],
  ["正在", " is "],
  ["回放", "replay"],
  ["新用户找不到", "New users can't find"],
  ["有完整的认知模型与目标", "has a full cognitive model and goals"],
  ["从你提供的真实", "Distilled from your real"],
  ["数据中蒸馏画像", " data into personas"],
  ["或使用我们的", "or use our"],
  ["每个", "each"],
  ["从", "from"],
  ["者", ""],
  ["不是", "not a"],
  ["完成", "done"],
  ["当", "when"],
  ["时", ""],
  ["次", "x"],
  ["小时", "h"],
  ["分钟", "min"],
  ["分", "m"],
  ["秒", "s"],
  ["位", ""],
];

const raw = await readFile(FILE, "utf8");
let s = decodeNonAscii(raw);

// CRITICAL: the bundle is minified JS. English replacements are inserted into
// existing JS string literals (some "...", some '...'). A raw " or ' in the
// replacement would terminate/break that literal and silently kill the app
// bundle. So sanitize every replacement to use curly quotes/apostrophes,
// which are ordinary characters inside any JS string literal.
function sanitize(en) {
  return en
    .replace(/"([^"]*)"/g, "“$1”") // paired "x" → "x"
    .replace(/"/g, "”")                   // stray "  → "
    .replace(/'/g, "’");                  // '      → '
}

// Longest Chinese first so full phrases are replaced before their fragments.
const SORTED = [...MAP].sort((a, b) => b[0].length - a[0].length);

let replaced = 0;
for (const [zh, enRaw] of SORTED) {
  const en = sanitize(enRaw);
  while (s.includes(zh)) {
    s = s.replace(zh, en);
    replaced++;
  }
}

// Report any leftover CJK so we know if the map is incomplete.
const leftover = [...new Set((s.match(/[一-鿿]+/g) || []))];
await writeFile(FILE, s, "utf8");

console.log(`replacements applied: ${replaced}`);
if (leftover.length) {
  console.log(`LEFTOVER CJK (${leftover.length}):`);
  leftover.slice(0, 40).forEach((x) => console.log("  " + x));
} else {
  console.log("✓ no CJK remaining in template");
}
