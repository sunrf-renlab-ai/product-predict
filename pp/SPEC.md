# Product Predict — Spec (v0.4)

## 设计哲学
**这不是多 agent 测试。这是用户体验模拟。**

- 提出的"问题"是体验观察，不是 bug 报告：节奏不对、不符合某类用户喜好、信息架构错位、跟竞品比不够吸引、表达让特定人群觉得被忽视。bug 是其中一种，但占少数。
- 每个 agent 是一个潜在用户的"一次会话"，他按自己的偏好和当下心情来用，不是来跑 checklist 的。
- 没有"步数任务"：他做完想做的就走，烦了就走，无聊了也走 —— 都是真实用户的合理理由。
- 报告的核心是"这类用户是怎么感受的"，而不是"这个产品有几个缺陷"。

## 一句话
给个 URL，AI 自动生成针对这个产品的合成用户群（含真实比例分布），用真实浏览器让他们各按各的偏好试一遍，回吐一份"用户感受报告" + 功能使用频率分析。

## CLI

```
pp personas generate <project-hint> [--n 8] [--save <name>]
                                                # AI 生成 N 个 persona, 含权重
pp personas from-beta <files...> [--save <name>]
                                                # 文档+音频 → AI 派生 persona
pp personas mixed <project-hint> <files...> [--save <name>]
                                                # 预设 + beta 融合
pp personas list                                # 已保存的 persona sets
pp personas show <name>                         # JSON dump
pp personas edit <name>                         # 用 $EDITOR 打开 JSON

pp run <url> [--personas <name>] [--agents N] [--steps K] [--out DIR]
                                                # 用指定 persona set 或临时生成
pp serve [--port P]                             # 报告浏览
pp list                                         # 历史 runs
```

Defaults: `--agents 6 --steps 10`。
如果 `--personas` 没给, `pp run` 会临时为这个目标生成一组（不持久化）。

## Persona schema (v0.3)

```ts
type Persona = {
  id: string;
  name: string;
  age: number;
  role: string;
  tech: 1..5;
  tone: string;                   // "急躁" / "好奇" / "保守"
  preferences: string[];          // 1+, e.g. "重视键盘快捷键"
  knownContext: string[];         // 已知信息，含竞品: "用 Notion 做笔记"
  weight: number;                 // 0..1, 总和约等于 1
  color: string;
  glyph: string;                  // 单字头像
  traits: string[];               // 2-3 短标签
  origin: "preset" | "beta" | "mixed" | "manual";
};
```

**不再有 `goal`** — 用 preferences 替代。LLM 给 persona 时不指定目标，让他凭偏好自然探索。
**不再有 `scenario`** — 每个 persona 按自己的 preferences 自由选择测什么；全测的覆盖率来自 persona 多样性。

## 三种 persona 来源

### preset (AI 生成)

输入: project hint (URL / 仓库描述 / 一句话产品介绍)
流程: 一次 LLM 调用 → JSON 数组（6-10 personas, weight 总和归一）
输出: PersonaSet, origin=preset

### from-beta (从内测数据派生)

输入: 文档 / 音频文件（多个）
解析:
- 文档: `.txt` `.md` (直接读) · `.pdf` (pdf-parse) · `.docx` (mammoth)
- 音频: `.mp3` `.wav` `.m4a` `.flac`
  - 本地 `whisper-cli` 优先 (homebrew: `whisper-cpp`)
  - fallback OpenAI Whisper API (需 `OPENAI_API_KEY`)
  - 都没有就报错并提示安装
流程: 解析 → 拼接成一份语料 → LLM "聚类用户群" prompt → JSON
输出: PersonaSet, origin=beta, sources=[...]

### mixed

预设的 AI 生成 + beta 派生, 让 LLM 合并并去重 + 调整权重让总分布更接近 beta 真实分布。
输出: PersonaSet, origin=mixed

## Persona 选择（run 时）

不是简单 slice — 按 weight 抽样:
- 累积分布 → 抽 N 次（去重）
- 高 weight 的 persona 可能被多次抽到 → 在 run 里实例化为 N 个独立 agent（保留 persona 但 id 加后缀 e.g. `a01-1`, `a01-2`）

## 文件布局

```
~/.pp/
  personas/
    <name>.json          # PersonaSet, 用户可编辑
    <name>.notes.md      # 可选笔记
  cache/
    whisper/             # 已转录的音频结果（path → text）

product-predict/pp/
  src/
    persona-gen.ts       # AI 生成 (preset)
    persona-derive.ts    # 从 beta 派生 (beta / mixed)
    parsers/
      document.ts        # txt/md/pdf/docx
      audio.ts           # whisper.cpp / OpenAI Whisper
      index.ts           # by ext 分派
    persona-store.ts     # 读写 ~/.pp/personas/
    cli.ts               # 新增 personas 子命令
    runner.ts            # weight 抽样
    agent.ts             # prompt 改造: preferences 替代 goal
    ...
```

## System prompt 变化

```
你叫 ${p.name}, ${p.age} 岁, ${p.role}. 性格基线: ${p.tone}.
特征: ${p.traits.join('、')}.
偏好:
  - ${p.preferences[0]}
  - ${p.preferences[1]}
  ...
已知信息（你脑子里关于工具/团队/竞品的真实背景）:
  - ${p.knownContext[0]}
  - ${p.knownContext[1]}
  ...

现在你刚打开 ${targetUrl}. 这不是测试任务 — 你按自己的偏好和当下心情, 像真实用户一样
用它. 你可能直奔自己关心的功能, 也可能逛逛, 也可能 5 步就放弃. 都行.
```

## 非目标 (v0.3)

- ✗ Persona 可视化编辑 UI (v0.3 用 `$EDITOR` 改 JSON)
- ✗ 比较 persona set 间的报告差异
- ✗ Whisper 增量更新 / 流式

## 已确认实现
- ✓ 文档解析 txt/md/pdf/docx
- ✓ 音频解析 whisper.cpp + OpenAI fallback
- ✓ 权重抽样
- ✓ Viewer Agents view 显示新字段
