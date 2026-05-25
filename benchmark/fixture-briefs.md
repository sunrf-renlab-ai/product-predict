# 20 Fixture Briefs

Each fixture is a small self-contained static HTML page (~80-200 lines) with
deliberately designed UX/design flaws. Categories spread so the benchmark
covers all 10 experience dimensions.

Each fixture needs:
- `fixtures/NN-slug/site/index.html`  — the broken product (self-contained, no
  external CSS frameworks beyond inline `<style>`, no JS frameworks)
- `fixtures/NN-slug/ground-truth.json` — `{ id, name, hint, port, groundTruth: [...] }`
  per `benchmark/scripts/types.ts`
- `fixtures/NN-slug/README.md` (optional) — what's broken and why

Categories: 信息架构 / 流程顺畅 / 功能契合 / 学习成本 / 视觉节奏 / 表达文案 / 可访问性 / 性能感知 / 与竞品对比 / 情感氛围.

Ports: 8201..8220 (one per fixture).

---

## Group A (slugs 01-05) — landing pages + onboarding

### 01-broken-todo · port 8201
A minimalist team todo app's landing. Hidden CTA, Cmd+/ instead of Cmd+K,
dark mode 2:1 contrast on secondary buttons, no preview of actual product.

GT issues (5):
- HIGH 流程顺畅: 整个落地页没有明显的「立即开始」/「试用」按钮
- HIGH 与竞品对比: 命令面板用 Cmd+/, 不符合 Linear/Notion 的 Cmd+K 习惯
- MED 可访问性: 暗色模式次要按钮对比度仅 2.1:1, 低于 WCAG AA
- MED 信息架构: 4 个导航 tab 点开都是 placeholder, 没有真实内容预览
- LOW 视觉节奏: hero 区文字密度过高, 标题副标题间隙太小

### 02-dense-pricing · port 8202
SaaS 定价页, 5 个 plan 横向挤在一起。

GT issues (6):
- HIGH 信息架构: 5 个 plan 横向挤在一行, 在 1280 视口下每个 plan 宽度仅 220px, 字会换行 3+ 次
- HIGH 表达文案: 价格用「从 $9 起」(starting at) 而不是确定价格, 用户疑虑
- MED 流程顺畅: 没有「联系销售」入口给 Enterprise plan, 只有一个 disabled 按钮
- MED 信息架构: 功能对比表收在 "View all features" 折叠里, 默认不展开
- MED 情感氛围: 所有 feature 用 ✓ ✗ 表示, 无差异化设计, 视觉太机械
- LOW 表达文案: 「Pro」「Pro+」「Business」「Business+」「Enterprise」命名混乱

### 03-heavy-signup · port 8203
注册流程 — 8 个字段一屏铺开, 没分步, 全部 required, validation 只在 submit 时弹。

GT issues (6):
- HIGH 流程顺畅: 8 个字段一屏铺开没分步, 用户看到立刻退缩
- HIGH 表达文案: 错误信息只是 "Invalid input", 不说错在哪个字段
- HIGH 情感氛围: 没有 progress indicator, 提交后无 loading 反馈
- MED 功能契合: 必填了 "Company size" 但展示成 dropdown 选项 1-5/6-20/21-100/100+, 个人用户没法选
- MED 可访问性: label 用 placeholder 实现, 输入后 label 消失
- LOW 学习成本: "Password must contain a number, uppercase, special char, and be 12+" 在 submit 后才告诉

### 04-empty-dashboard · port 8204
项目管理工具的初始空状态 dashboard。

GT issues (5):
- HIGH 流程顺畅: 空状态只显示 "No projects yet.", 没有「创建第一个项目」CTA
- HIGH 学习成本: 左侧导航有 8 个 tab (Projects/Tasks/Milestones/Sprints/...), 新用户不知道概念差别
- MED 情感氛围: 整体氛围冷淡, 没有引导式 onboarding tour
- MED 信息架构: "Help" 和 "Docs" 是两个不同入口, 内容重复
- LOW 视觉节奏: 顶部 status bar 占了 80px 高度但只显示一行字, 浪费空间

### 05-modal-trap · port 8205
登录后立刻弹窗的 onboarding modal。

GT issues (5):
- HIGH 流程顺畅: modal 没有「跳过」选项, 「关闭」按钮在右下角不显眼
- HIGH 信息架构: modal 占满 90% 视口, 后面页面看不到, 用户不知道产品长什么样
- MED 学习成本: modal 5 步引导, 每步只有「下一步」, 不能回头改前面的选择
- MED 表达文案: 引导文案用 "Hi there! Welcome to our amazing product 🎉" 等套话
- LOW 视觉节奏: modal 内部按钮大小不一, 主 CTA 反而比次要按钮小

---

## Group B (slugs 06-10) — forms + flows

### 06-silent-form · port 8206
联系表单 - 提交后毫无反馈。

GT issues (5):
- HIGH 流程顺畅: 提交后 button 没变 disabled, 没 loading, 页面无变化, 不知道有没有提交成功
- HIGH 情感氛围: 没有任何成功 / 失败提示, 用户疑惑
- MED 表达文案: 表单标题就叫 "Form" — 无意义
- MED 可访问性: 必填字段没有视觉提示 (无星号/无颜色)
- LOW 视觉节奏: textarea 默认高度只有 40px, 写一句话就要 scroll

### 07-lost-search · port 8207
搜索结果页 - 没有 zero state, 输入错字没建议。

GT issues (5):
- HIGH 信息架构: 搜不到结果时只显示空白, 没有 "No results for X" 提示
- HIGH 功能契合: 没有 typo correction 或 autocomplete, 关键词稍错就 0 结果
- MED 表达文案: 搜索框 placeholder 是 "Search...", 没告诉用户能搜什么
- MED 流程顺畅: 搜索 input 没有 clear (×) 按钮, 要全选删除才能换关键词
- LOW 视觉节奏: 搜索结果都是同样大小的卡片, 没区分主次

### 08-stuck-wizard · port 8208
多步骤设置向导。

GT issues (6):
- HIGH 流程顺畅: 第 3 步没有「返回上一步」, 用户填错了只能从头来
- HIGH 性能感知: 切换步骤时整页 reload, 输入数据丢失
- MED 学习成本: 步骤名「Configure」「Customize」「Optimize」语义模糊不知道差别
- MED 信息架构: 顶部进度条只显示步号 1/5, 不知道每步要做什么
- MED 情感氛围: 完成全部 5 步后只显示 "Done", 没有庆祝感
- LOW 视觉节奏: 每步表单高度差很大, 1 步只有 100px, 3 步有 800px, 整体布局跳跃

### 09-fixed-template · port 8209
笔记应用 - 只能用 3 个固定模板。

GT issues (5):
- HIGH 功能契合: 只能用「会议记录」「日记」「Todo」3 个模板, 无法自定义
- HIGH 与竞品对比: Notion 和 Obsidian 都支持自定义模板, 这个不能
- MED 信息架构: 模板选择界面占满首屏, 不能跳过直接写
- MED 表达文案: 「Apply Template」按钮文案太正式, 应该是「用这个开始」
- LOW 视觉节奏: 3 个模板卡片用了不同的色调, 没有视觉一致性

### 10-buried-export · port 8210
分析 dashboard, 导出功能藏得超深。

GT issues (5):
- HIGH 信息架构: 导出 PDF 藏在 Settings → Reports → Weekly Digest → Export, 4 层深
- HIGH 功能契合: 导出格式只有 CSV / JSON, 没有 PDF (老板要的)
- MED 流程顺畅: 导出后没有「下载链接」, 是邮件发送, 用户找不到
- MED 表达文案: "Export schedule" 和 "Schedule export" 两个不同入口, 名字相似功能不同
- LOW 视觉节奏: dashboard 顶部图表占 60% 屏幕, 但下面的关键数据被压缩

---

## Group C (slugs 11-15) — UI/visual + accessibility

### 11-modal-modal · port 8211
连续弹窗 — 关一个又弹一个。

GT issues (5):
- HIGH 情感氛围: 进入页面立刻弹 cookie banner + Email subscribe + 「升级 Pro」, 三连弹用户烦躁
- HIGH 流程顺畅: cookie banner 不点「同意」就无法滚动页面
- MED 视觉节奏: 弹窗用了不同的视觉样式 (一个圆角, 一个直角, 一个带阴影), 不一致
- MED 表达文案: 「Subscribe」按钮巨大, 「No thanks」是小字灰色, 设计性 dark pattern
- LOW 可访问性: cookie banner 的「同意」用绿色, 「拒绝」用浅灰, 对比度太低易误点

### 12-noisy-notifs · port 8212
通知中心 — 没有分组/批处理。

GT issues (5):
- HIGH 信息架构: 50 条通知全部展开, 没有按类型分组 (mention / system / digest)
- HIGH 功能契合: 没有「全部标为已读」按钮, 必须一条条点
- MED 流程顺畅: 通知点击后跳转新 tab 不在原 tab, 工作流断
- MED 视觉节奏: 所有通知用同样大小, 重要的 mention 和普通的 system 没区分
- LOW 表达文案: 时间显示「3 hours ago」混着「2026-05-21 14:23」, 不一致

### 13-mobile-broken · port 8213
桌面设计直接 stack 到移动端。

GT issues (5):
- HIGH 流程顺畅: 移动端有水平滚动 (overflow), 用户必须左右滑
- HIGH 可访问性: 按钮高度 28px, 远低于 44px 触控规范
- MED 视觉节奏: 桌面 3 列布局直接堆成手机 1 列, 间距没调整, 卡片间塞太密
- MED 信息架构: 顶部导航在手机上变成 6 个挤在一起的小图标, 没有 hamburger 菜单
- LOW 性能感知: 没有 viewport meta tag, 初始缩放成桌面比例

### 14-rage-button · port 8214
"同步" 按钮 - 点了无反馈。

GT issues (5):
- HIGH 流程顺畅: 点 「Sync now」按钮没有任何视觉反馈, 用户重复点 5 次
- HIGH 情感氛围: 同步实际在后台运行, 但 UI 完全静止, 用户怀疑产品坏了
- MED 表达文案: 按钮叫 "Sync" 没说同步什么 (邮件? 文件? 设置?)
- MED 视觉节奏: 按钮在页面右上角孤立放置, 周围空荡
- LOW 可访问性: 按钮没有 disabled state, 用户不知道点过了

### 15-emoji-mess · port 8215
emoji 滥用 + 中英混杂。

GT issues (6):
- HIGH 视觉节奏: 每个标题前后都加了 🚀 ✨ 🎯 等 emoji, 视觉杂乱
- HIGH 表达文案: 中英混写 "Welcome to 我们的 amazing 产品", 阅读卡顿
- MED 情感氛围: 用力过猛的营销腔 (「Unlock the power of...」「Your all-in-one...」)
- MED 视觉节奏: 字体用了 5 种 (system + Comic Sans + Pacifico + Roboto + Arial), 混乱
- MED 可访问性: emoji 没有 alt text, 屏幕阅读器读出来很奇怪
- LOW 表达文案: 「!!!」感叹号连续 3 个出现在 CTA 上

---

## Group D (slugs 16-20) — copy + integration + advanced

### 16-placeholder-label · port 8216
表单 - label 全部用 placeholder 实现。

GT issues (5):
- HIGH 可访问性: 输入框 label 用 placeholder 实现, 输入后 label 消失, 用户忘记字段是什么
- HIGH 表达文案: placeholder 用「e.g. john@example.com」混着「Type your email」, 不一致
- MED 流程顺畅: tab 键跳到下一个字段时没有清楚的 focus 视觉
- MED 信息架构: 必填和可选字段没有区分标记
- LOW 视觉节奏: 字段间距过大 (24px), 8 字段表单显得超长

### 17-monolingual · port 8217
工具设置页 - 中文界面里混了硬编码英文。

GT issues (5):
- HIGH 表达文案: 中文界面里有「Settings」「Save」「Cancel」英文硬编码
- HIGH 与竞品对比: 同类工具 (Notion / Linear / Figma) 都做了完整本地化
- MED 表达文案: 日期格式「2026-05-25」(ISO) 跟「May 25, 2026」(US) 混用
- MED 情感氛围: 错误提示「Something went wrong.」未翻译, 中文用户看不懂
- LOW 信息架构: 中英搜索结果没分开, 搜「保存」找不到 "Save" 项

### 18-no-keyboard · port 8218
表单工具 - 完全不支持键盘。

GT issues (5):
- HIGH 可访问性: 整个页面只有鼠标交互, tab 键不工作
- HIGH 与竞品对比: 同类工具都有 Cmd+S 保存, Cmd+Enter 提交
- MED 流程顺畅: 必须点击保存, 没有自动保存
- MED 信息架构: 没有 keyboard shortcut help (常用的 ? 弹出快捷键列表)
- LOW 表达文案: 「Save」按钮没有快捷键提示, 用户不知道有捷径

### 19-slow-perceived · port 8219
列表页 - 没有 skeleton loader。

GT issues (5):
- HIGH 性能感知: 页面加载 1.5s 期间整个内容区是白屏, 没有 skeleton
- HIGH 情感氛围: 数据来了之后内容「snap」出来, 没有过渡, 突兀
- MED 视觉节奏: 列表项加载顺序随机, 不是从上往下流式
- MED 流程顺畅: 滚到底没有 "加载更多" 按钮也没有自动 infinite scroll
- LOW 表达文案: 列表为空时显示 "Loading..." 永久状态, 实际是加载完成无数据

### 20-anti-pattern · port 8220
故意做反 - 这个 fixture 是「看起来有问题但其实没问题」的迷惑项, 测试 pp 的精度。

GT issues (3):  ← 只有 3 个真实问题, 其他都是看似可疑实际合理的设计
- MED 表达文案: 「Beta」标签字号比其他都大, 视觉抢眼可能干扰
- MED 视觉节奏: 全页只有一种主色 (lime), 视觉单一可能被误判
- LOW 信息架构: 二级导航藏在更多 menu 里, 但这是 intentional 简化

陷阱 (NOT issues, but might be flagged by pp):
- 「Sign Up」按钮在 hero 区下方 (实际不是 above-the-fold 但不算问题)
- 字体只有一种 (intentional minimalism)
- 没有客户 logo wall (intentional, B2B 工具不需要)

---

## Implementation notes

每个 fixture 的 `ground-truth.json` 严格按 `benchmark/scripts/types.ts` 的 `Fixture` shape:

```json
{
  "id": "01-broken-todo",
  "name": "Broken Todo Landing",
  "hint": "A team todo app landing page — pp 应该识别出 CTA 缺失等问题",
  "port": 8201,
  "description": "minimalist todo landing with hidden CTA + Cmd+/ + dark contrast issues",
  "groundTruth": [
    { "id": "gt-01", "title": "...", "severity": "high", "category": "流程顺畅", "description": "..." },
    ...
  ]
}
```

HTML 要求:
- 完全 self-contained 单文件
- 无外部 dependency (no React/Vue/Tailwind, 只 vanilla HTML+CSS+JS)
- 视觉上看起来像个 *真实* 的 SaaS 产品, 不能太敷衍
- 主题保持 暗色为主 / 现代 SaaS 风格 (符合 pp 报告的审美)
- 200 行内 (含 inline CSS)
