// Synthetic data for the Product Predict prototype
// Demo product being tested: "Pebble" — a team todo app

const PROJECT = {
  name: "pebble-app",
  org: "lumen-labs",
  branch: "main",
  commit: "f9c2a1e",
  stack: ["React", "Tailwind", "Node", "Postgres"],
  description: "团队待办 · 异步任务流",
  pages: 14,
  components: 87,
  routes: ["/", "/inbox", "/today", "/projects/:id", "/settings"],
};

const PAST_RUNS = [
  { id: "r-042", name: "pebble-app", branch: "main", commit: "f9c2a1e", agents: 24, status: "running", time: "刚刚", score: null },
  { id: "r-041", name: "pebble-app", branch: "feat/onboarding-v2", commit: "8a7e0d1", agents: 24, status: "done", time: "2 小时前", score: 72 },
  { id: "r-039", name: "pebble-app", branch: "main", commit: "3c2f4a9", agents: 12, status: "done", time: "昨天", score: 68 },
  { id: "r-037", name: "linen-crm", branch: "main", commit: "b1d3e22", agents: 24, status: "done", time: "3 天前", score: 81 },
  { id: "r-031", name: "studio-canvas", branch: "main", commit: "a09cc4f", agents: 50, status: "done", time: "上周", score: 64 },
];

// Agent personas — diverse, opinionated, plausible
const AGENTS = [
  { id: "a01", name: "Maya Chen", age: 28, role: "产品经理", tech: 4, tone: "挑剔", goal: "为团队选型", color: "#e6c976", glyph: "M", traits: ["效率控", "重视协作"] },
  { id: "a02", name: "Kenji Okada", age: 41, role: "工程主管", tech: 5, tone: "急躁", goal: "评估技术债", color: "#7fb069", glyph: "K", traits: ["键盘党", "重视快捷键"] },
  { id: "a03", name: "Priya Raman", age: 34, role: "设计师", tech: 3, tone: "敏感", goal: "评估视觉一致性", color: "#c98686", glyph: "P", traits: ["美感导向", "注意排版"] },
  { id: "a04", name: "Lars Hjelm", age: 52, role: "创业者", tech: 2, tone: "困惑", goal: "替代纸笔", color: "#a89cc8", glyph: "L", traits: ["新手", "不耐烦"] },
  { id: "a05", name: "Sofia Reyes", age: 23, role: "实习生", tech: 4, tone: "好奇", goal: "学习工具", color: "#76b5c5", glyph: "S", traits: ["移动端优先", "爱探索"] },
  { id: "a06", name: "Tomás Vega", age: 37, role: "自由开发者", tech: 5, tone: "理性", goal: "管理多客户", color: "#d8a05e", glyph: "T", traits: ["重视 API", "深度定制"] },
  { id: "a07", name: "Aiko Tanaka", age: 29, role: "运营", tech: 3, tone: "细致", goal: "追踪进度", color: "#b8c474", glyph: "A", traits: ["重视通知", "邮件依赖"] },
  { id: "a08", name: "Rohan Mehta", age: 45, role: "顾问", tech: 2, tone: "保守", goal: "团队透明度", color: "#8a9bb4", glyph: "R", traits: ["重视权限", "讨厌惊喜"] },
  { id: "a09", name: "Yuki Sato", age: 26, role: "前端", tech: 5, tone: "技术宅", goal: "尝试键盘流", color: "#c87fa9", glyph: "Y", traits: ["Vim 用户", "暗色模式"] },
  { id: "a10", name: "Elena Kowalski", age: 33, role: "市场", tech: 3, tone: "外向", goal: "跨团队同步", color: "#e89978", glyph: "E", traits: ["视觉导向", "重视分享"] },
  { id: "a11", name: "Daniel Park", age: 39, role: "数据分析", tech: 4, tone: "怀疑", goal: "导出与报表", color: "#9bb88a", glyph: "D", traits: ["重视数据", "导出狂魔"] },
  { id: "a12", name: "Nadia Volkov", age: 31, role: "客户成功", tech: 3, tone: "温和", goal: "替换 Asana", color: "#a8a8c8", glyph: "N", traits: ["重视模板", "团队思维"] },
];

// Live simulation activity stream
const ACTIVITY = [
  { t: "00:00:02", agent: "a01", kind: "enter",  text: "进入登录页，注意到「使用 Google 登录」靠下，先扫了一眼定价。", sentiment: 0 },
  { t: "00:00:08", agent: "a05", kind: "click",  text: "尝试在登录前点击「查看 demo」，但页面没有响应。", sentiment: -1 },
  { t: "00:00:14", agent: "a02", kind: "shortcut", text: "按下 Cmd+K 试图打开命令面板，没有反应。", sentiment: -1 },
  { t: "00:00:19", agent: "a04", kind: "confused", text: "盯着空状态画面 8 秒，没看到「创建第一个任务」的入口在哪。", sentiment: -2 },
  { t: "00:00:23", agent: "a09", kind: "delight", text: "发现侧边栏可以折叠，宽度记忆得很好。", sentiment: 2 },
  { t: "00:00:28", agent: "a03", kind: "note",  text: "「任务卡片」与「项目卡片」的圆角不一致：6px vs 8px。", sentiment: -1 },
  { t: "00:00:34", agent: "a07", kind: "click",  text: "在通知设置里找了 40 秒才找到「邮件摘要」开关。", sentiment: -1 },
  { t: "00:00:41", agent: "a11", kind: "search", text: "搜索「导出 CSV」无结果，去帮助中心也没找到。", sentiment: -2 },
  { t: "00:00:47", agent: "a06", kind: "shortcut", text: "Tab 键在任务标题间穿梭很流畅，按 Enter 进入编辑模式。", sentiment: 2 },
  { t: "00:00:53", agent: "a08", kind: "confused", text: "试图给团队成员设只读权限，但权限只有「成员/管理员」两档。", sentiment: -2 },
  { t: "00:00:59", agent: "a10", kind: "click",  text: "分享任务的链接需要登录才能查看，无法直接发给客户。", sentiment: -2 },
  { t: "00:01:04", agent: "a12", kind: "note",  text: "「项目模板」很好，但只有 3 个，且都偏向开发团队。", sentiment: -1 },
  { t: "00:01:09", agent: "a02", kind: "rage",   text: "连续点击「同步」按钮 5 次，没有反馈状态。", sentiment: -2 },
  { t: "00:01:14", agent: "a01", kind: "delight", text: "拖拽任务在不同列之间的动画非常顺滑。", sentiment: 2 },
  { t: "00:01:19", agent: "a05", kind: "click",  text: "尝试在移动端添加任务，键盘弹起后输入框被遮住一半。", sentiment: -2 },
  { t: "00:01:25", agent: "a04", kind: "exit",   text: "10 分钟后未创建任何任务，关闭了页面。", sentiment: -3 },
  { t: "00:01:31", agent: "a03", kind: "note",  text: "深色模式下「次要按钮」对比度只有 2.1:1，低于 WCAG AA。", sentiment: -2 },
  { t: "00:01:37", agent: "a09", kind: "delight", text: "命令面板 Cmd+/ 终于找到了，但快捷键应该是 Cmd+K。", sentiment: 1 },
  { t: "00:01:43", agent: "a07", kind: "click",  text: "「截止日期」字段只支持日期，没有时间，对会议任务不方便。", sentiment: -1 },
  { t: "00:01:49", agent: "a06", kind: "search", text: "API 文档藏在帮助中心三层目录里，搜索关键词「webhook」无结果。", sentiment: -2 },
  { t: "00:01:55", agent: "a10", kind: "delight", text: "邀请协作者时可以批量粘贴邮箱列表，省了不少时间。", sentiment: 2 },
  { t: "00:02:01", agent: "a11", kind: "click",  text: "报表页面加载用了 3.4 秒，期间没有任何骨架屏。", sentiment: -1 },
];

const ISSUES = [
  { id: "i01", title: "新用户找不到「创建任务」入口", severity: "high", agents: 9, category: "Onboarding", quote: "我盯着空白页面看了快十秒，不知道下一步要做什么。", agentRef: "a04", evidence: 14, journey: "首次会话 · 第 8 秒" },
  { id: "i02", title: "命令面板快捷键不符合直觉（应为 Cmd+K）", severity: "high", agents: 11, category: "Keyboard", quote: "凡是 SaaS 产品都用 Cmd+K，你们用 Cmd+/ 我会反复按错。", agentRef: "a02", evidence: 23, journey: "全程" },
  { id: "i03", title: "缺少 CSV / API 导出能力", severity: "high", agents: 7, category: "Data", quote: "数据进得来出不去，我没法把它接入我们现有的报表。", agentRef: "a11", evidence: 9, journey: "数据/集成场景" },
  { id: "i04", title: "权限粒度太粗（只有成员/管理员两档）", severity: "med", agents: 6, category: "Admin", quote: "我想让客户只读看进度，但只能选成员，他们就能改任务了。", agentRef: "a08", evidence: 11, journey: "邀请协作场景" },
  { id: "i05", title: "深色模式次要按钮对比度不足（2.1:1）", severity: "med", agents: 4, category: "A11y", quote: "我得眯着眼才能看清「取消」按钮。", agentRef: "a03", evidence: 6, journey: "全程" },
  { id: "i06", title: "移动端键盘遮挡输入区域", severity: "med", agents: 5, category: "Mobile", quote: "在地铁上想快速记一条，结果看不到自己输什么。", agentRef: "a05", evidence: 8, journey: "移动端添加任务" },
  { id: "i07", title: "「同步」按钮无加载反馈，疑似无效", severity: "low", agents: 3, category: "Feedback", quote: "我点了 5 次，不知道有没有用，干脆刷新了页面。", agentRef: "a02", evidence: 4, journey: "同步场景" },
  { id: "i08", title: "项目模板只有 3 个且都偏开发团队", severity: "low", agents: 4, category: "Templates", quote: "我是做市场的，「Bug Triage」模板对我没意义。", agentRef: "a12", evidence: 5, journey: "新建项目" },
];

const DELIGHTS = [
  { title: "拖拽任务的物理感动画", count: 14, quote: "看完拖拽我笑了，这个手感比 Linear 还顺。", agent: "a01" },
  { title: "批量粘贴邮箱邀请", count: 11, quote: "省了我十几次复制粘贴。", agent: "a10" },
  { title: "侧边栏宽度记忆", count: 9, quote: "我每次回来都还是我喜欢的宽度。", agent: "a09" },
  { title: "Tab/Enter 键盘流", count: 7, quote: "完全不用鼠标也能加任务。", agent: "a06" },
];

// Cumulative sentiment over time (for the journey chart)
const SENTIMENT_CURVE = [
  { t: 0, v: 0.5 }, { t: 5, v: 0.55 }, { t: 10, v: 0.4 }, { t: 15, v: 0.3 },
  { t: 20, v: 0.2 }, { t: 25, v: 0.45 }, { t: 30, v: 0.3 }, { t: 35, v: 0.15 },
  { t: 40, v: 0.2 }, { t: 45, v: 0.5 }, { t: 50, v: 0.55 }, { t: 55, v: 0.4 },
  { t: 60, v: 0.25 }, { t: 65, v: 0.2 }, { t: 70, v: 0.4 }, { t: 75, v: 0.6 },
  { t: 80, v: 0.55 }, { t: 85, v: 0.35 }, { t: 90, v: 0.4 }, { t: 95, v: 0.5 },
  { t: 100, v: 0.45 },
];

const ROUTES_HEAT = [
  { path: "/", visits: 24, dwell: 12, drop: 0.08 },
  { path: "/inbox", visits: 21, dwell: 38, drop: 0.14 },
  { path: "/today", visits: 19, dwell: 92, drop: 0.05 },
  { path: "/projects/:id", visits: 17, dwell: 145, drop: 0.18 },
  { path: "/projects/new", visits: 14, dwell: 67, drop: 0.42 },
  { path: "/settings", visits: 9, dwell: 84, drop: 0.22 },
  { path: "/settings/billing", visits: 4, dwell: 23, drop: 0.50 },
];

Object.assign(window, { PROJECT, PAST_RUNS, AGENTS, ACTIVITY, ISSUES, DELIGHTS, SENTIMENT_CURVE, ROUTES_HEAT });
