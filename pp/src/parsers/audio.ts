import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import {
  mkdir,
  readFile,
  stat,
  writeFile,
  unlink,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { extname, join } from "node:path";

export type ParsedAudio = {
  path: string;
  kind: "audio";
  bytes: number;
  text: string;
  transcriptChars: number;
  durationSec?: number;
  warnings: string[];
  provider: "whisper-cpp" | "openai-whisper" | "none";
};

const AUDIO_EXTS = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".flac",
  ".ogg",
  ".webm",
  ".aac",
]);

const CACHE_DIR = join(homedir(), ".pp", "cache", "whisper");

function detectWhisperCpp(): string | null {
  try {
    const out = execSync("which whisper-cli", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return out || null;
  } catch {
    return null;
  }
}

function findWhisperModel(): string | null {
  const candidates = [
    process.env.WHISPER_MODEL,
    join(homedir(), ".pp", "whisper-models", "ggml-base.bin"),
    "/opt/homebrew/share/whisper-cpp/ggml-base.bin",
  ].filter((p): p is string => !!p);
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

async function cacheKey(path: string): Promise<string> {
  const buf = await readFile(path);
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

async function loadCache(key: string): Promise<string | null> {
  const file = join(CACHE_DIR, `${key}.txt`);
  if (!existsSync(file)) return null;
  return await readFile(file, "utf8");
}

async function saveCache(key: string, text: string): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(join(CACHE_DIR, `${key}.txt`), text, "utf8");
}

async function transcribeWithWhisperCpp(
  cli: string,
  model: string,
  audioPath: string,
): Promise<string> {
  const outBase = join(
    tmpdir(),
    `pp-whisper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const outTxt = `${outBase}.txt`;
  try {
    execSync(
      `${JSON.stringify(cli)} -m ${JSON.stringify(model)} -f ${JSON.stringify(
        audioPath,
      )} -otxt -of ${JSON.stringify(outBase)} --no-prints`,
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    return await readFile(outTxt, "utf8");
  } finally {
    try {
      await unlink(outTxt);
    } catch {
      // ignore — file may not exist if whisper-cli failed before writing
    }
  }
}

async function transcribeWithOpenAI(audioPath: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  const buf = await readFile(audioPath);
  const fileName = audioPath.split("/").pop() ?? "audio";
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buf)]), fileName);
  form.append("model", "whisper-1");
  const res = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `openai whisper request failed: ${res.status} ${res.statusText} ${body}`.trim(),
    );
  }
  const data: any = await res.json();
  if (typeof data?.text !== "string") {
    throw new Error("openai whisper returned no text field");
  }
  return data.text;
}

export async function parseAudio(path: string): Promise<ParsedAudio> {
  const ext = extname(path).toLowerCase();
  if (!AUDIO_EXTS.has(ext)) {
    throw new Error(`unsupported audio extension: ${ext || "(none)"}`);
  }
  const warnings: string[] = [];
  const st = await stat(path);
  const bytes = st.size;

  const key = await cacheKey(path);
  const cached = await loadCache(key);
  if (cached !== null) {
    const text = cached.trim();
    warnings.push("loaded from cache");
    return {
      path,
      kind: "audio",
      bytes,
      text,
      transcriptChars: text.length,
      warnings,
      provider: "none",
    };
  }

  const cli = detectWhisperCpp();
  let rawText: string | null = null;
  let provider: ParsedAudio["provider"] = "none";

  if (cli) {
    const model = findWhisperModel();
    if (model) {
      rawText = await transcribeWithWhisperCpp(cli, model, path);
      provider = "whisper-cpp";
    } else {
      warnings.push(
        "whisper-cli found but no model file (set $WHISPER_MODEL or download ggml-base.bin); falling back",
      );
    }
  }

  if (rawText === null && process.env.OPENAI_API_KEY) {
    rawText = await transcribeWithOpenAI(path);
    provider = "openai-whisper";
  }

  if (rawText === null) {
    throw new Error(
      [
        "no audio transcriber available. install one of:",
        "  brew install whisper-cpp && curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin -o ~/.pp/whisper-models/ggml-base.bin",
        "or:",
        "  export OPENAI_API_KEY=sk-...",
      ].join("\n"),
    );
  }

  const text = rawText.trim();
  await saveCache(key, text);

  return {
    path,
    kind: "audio",
    bytes,
    text,
    transcriptChars: text.length,
    warnings,
    provider,
  };
}
