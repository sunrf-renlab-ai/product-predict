import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";

export type ParsedDocument = {
  path: string;
  kind: "doc";
  bytes: number;
  textChars: number;
  text: string;
  warnings: string[];
};

const TEXT_EXTS = new Set([".txt", ".md", ".markdown", ".json", ".csv"]);
const HTML_EXTS = new Set([".html", ".htm"]);

async function extractTxt(path: string): Promise<string> {
  return await readFile(path, "utf8");
}

async function extractHtml(path: string): Promise<string> {
  const raw = await readFile(path, "utf8");
  // Strip script/style blocks first, then all remaining tags, then decode a few common entities.
  const noScripts = raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const noTags = noScripts.replace(/<[^>]+>/g, " ");
  return noTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

async function extractPdf(
  path: string,
  warnings: string[],
): Promise<string> {
  try {
    // pdf-parse v2 ships an ESM `PDFParse` class; fall back to default export for v1.
    const mod: any = await import("pdf-parse");
    const buf = await readFile(path);
    if (mod.PDFParse) {
      const parser = new mod.PDFParse({ data: new Uint8Array(buf) });
      try {
        const result = await parser.getText();
        return typeof result?.text === "string" ? result.text : "";
      } finally {
        await parser.destroy?.();
      }
    }
    const fn = mod.default ?? mod;
    const result = await fn(buf);
    return typeof result?.text === "string" ? result.text : "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`pdf extraction failed: ${msg}`);
    return "";
  }
}

async function extractDocx(
  path: string,
  warnings: string[],
): Promise<string> {
  try {
    const mammoth: any = await import("mammoth");
    const fn = mammoth.extractRawText ?? mammoth.default?.extractRawText;
    const result = await fn({ path });
    if (Array.isArray(result?.messages)) {
      for (const m of result.messages) {
        if (m?.message) warnings.push(`docx: ${m.message}`);
      }
    }
    return typeof result?.value === "string" ? result.value : "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`docx extraction failed: ${msg}`);
    return "";
  }
}

function normalize(text: string): string {
  // Normalize CRLF, trim, collapse runs of 3+ blank lines to exactly 2.
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function parseDocument(path: string): Promise<ParsedDocument> {
  const ext = extname(path).toLowerCase();
  const warnings: string[] = [];
  const st = await stat(path);
  const bytes = st.size;

  let raw: string;
  if (TEXT_EXTS.has(ext)) {
    raw = await extractTxt(path);
  } else if (HTML_EXTS.has(ext)) {
    raw = await extractHtml(path);
  } else if (ext === ".pdf") {
    raw = await extractPdf(path, warnings);
  } else if (ext === ".docx") {
    raw = await extractDocx(path, warnings);
  } else {
    throw new Error(`unsupported document extension: ${ext || "(none)"}`);
  }

  const text = normalize(raw);
  if (text.length < 50) {
    warnings.push(
      "extracted text very short, may indicate scan-only PDF or encoding issue",
    );
  }

  return {
    path,
    kind: "doc",
    bytes,
    textChars: text.length,
    text,
    warnings,
  };
}
