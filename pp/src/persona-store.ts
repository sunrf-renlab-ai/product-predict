// Read / write PersonaSets to ~/.pp/personas/<slug>.json so users can curate
// reusable persona populations across runs.
import { mkdir, readdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { PersonaSet } from "./types.js";

const STORE_DIR = join(homedir(), ".pp", "personas");

export async function ensureStore(): Promise<string> {
  await mkdir(STORE_DIR, { recursive: true });
  return STORE_DIR;
}

export async function savePersonaSet(set: PersonaSet, slug?: string): Promise<string> {
  await ensureStore();
  const id = slug || set.id || slugify(set.name) || `set-${Date.now()}`;
  const path = join(STORE_DIR, `${id}.json`);
  await writeFile(path, JSON.stringify({ ...set, id }, null, 2));
  return path;
}

export async function loadPersonaSet(slug: string): Promise<PersonaSet> {
  await ensureStore();
  const path = join(STORE_DIR, `${slug}.json`);
  if (!existsSync(path)) {
    throw new Error(
      `persona set "${slug}" not found at ${path}\n` +
      `available: ${(await listPersonaSets()).map((s) => s.id).join(", ") || "(none)"}`
    );
  }
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as PersonaSet;
}

export async function listPersonaSets(): Promise<
  Array<{ id: string; name: string; origin: string; count: number; createdAt: string; path: string }>
> {
  await ensureStore();
  const names = await readdir(STORE_DIR);
  const out: Array<{ id: string; name: string; origin: string; count: number; createdAt: string; path: string }> = [];
  for (const n of names) {
    if (!n.endsWith(".json")) continue;
    const p = join(STORE_DIR, n);
    try {
      const set = JSON.parse(await readFile(p, "utf8")) as PersonaSet;
      out.push({
        id: set.id,
        name: set.name,
        origin: set.origin,
        count: set.personas?.length || 0,
        createdAt: set.createdAt,
        path: p,
      });
    } catch {
      // skip malformed file
    }
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

export function personaSetPath(slug: string): string {
  return join(STORE_DIR, `${slug}.json`);
}

export async function deletePersonaSet(slug: string): Promise<void> {
  const path = personaSetPath(slug);
  if (!existsSync(path)) throw new Error(`persona set "${slug}" not found`);
  const { unlink } = await import("node:fs/promises");
  await unlink(path);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Tiny helpers re-exported for the CLI.
export const STORE_PATH = STORE_DIR;
export { stat as statFile };
