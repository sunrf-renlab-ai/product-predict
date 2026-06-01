// Cross-platform secret storage for pp credentials.
//
//   macOS (darwin) → login Keychain via `security` (unchanged — existing users
//                    keep working, secrets stay in the OS keystore).
//   Windows / Linux → a JSON file at ~/.pp/credentials.json, chmod 600.
//
// Values are opaque strings: a raw token, or a JSON blob the caller parses
// (e.g. the MiniMax { main, simulation } entry). Env-var overrides
// (PP_AUTH_TOKEN, PP_SIM_KEYS, …) are the caller's concern, not this module's.
//
// PP_HOME overrides the base dir (tests / CI / portable installs).

import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile, chmod, rename } from "node:fs/promises";

const execFileP = promisify(execFile);
const isMac = process.platform === "darwin";

function ppHome(): string {
  return process.env.PP_HOME || join(homedir(), ".pp");
}

function credsPath(): string {
  return join(ppHome(), "credentials.json");
}

async function readStore(): Promise<Record<string, string>> {
  try {
    const obj = JSON.parse(await readFile(credsPath(), "utf8"));
    return obj && typeof obj === "object" ? (obj as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function writeStore(map: Record<string, string>): Promise<void> {
  await mkdir(ppHome(), { recursive: true });
  const p = credsPath();
  // Write to a pid-unique temp file, then atomically rename over the target.
  // A crash or a concurrent writer can therefore never leave a half-written /
  // corrupt creds file (worst case is a lost update — same semantics as the
  // macOS Keychain's `add-generic-password -U`). rename replaces the existing
  // file on POSIX and on Windows (libuv MOVEFILE_REPLACE_EXISTING).
  // mode on writeFile is ignored on Windows; chmod is a no-op there too.
  const tmp = `${p}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(map, null, 2) + "\n", { encoding: "utf8", mode: 0o600 });
  await rename(tmp, p);
  await chmod(p, 0o600).catch(() => {});
}

// Read a secret. Returns null if absent. macOS reads Keychain; elsewhere the file.
export async function getSecret(service: string): Promise<string | null> {
  if (isMac) {
    try {
      const { stdout } = await execFileP("security", ["find-generic-password", "-s", service, "-w"]);
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }
  const map = await readStore();
  return map[service] ?? null;
}

// Synchronous read — for the synchronous LLM provider detection path.
// Same semantics as getSecret().
export function getSecretSync(service: string): string | null {
  if (isMac) {
    try {
      const out = execFileSync("security", ["find-generic-password", "-s", service, "-w"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return out.trim() || null;
    } catch {
      return null;
    }
  }
  try {
    const obj = JSON.parse(readFileSync(credsPath(), "utf8"));
    const v = obj && typeof obj === "object" ? obj[service] : undefined;
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}

// Store (create or update) a secret.
export async function setSecret(service: string, value: string): Promise<void> {
  if (isMac) {
    await execFileP("security", [
      "add-generic-password", "-U", "-a", process.env.USER || process.env.USERNAME || "pp", "-s", service, "-w", value,
    ]);
    return;
  }
  const map = await readStore();
  map[service] = value;
  await writeStore(map);
}

// Remove a secret. Idempotent — silent if it doesn't exist.
export async function deleteSecret(service: string): Promise<void> {
  if (isMac) {
    await execFileP("security", ["delete-generic-password", "-s", service]).catch(() => {});
    return;
  }
  const map = await readStore();
  if (service in map) {
    delete map[service];
    await writeStore(map);
  }
}

// Where credentials live, for diagnostics / `pp whoami`.
export function secretStoreLocation(): string {
  return isMac ? "macOS Keychain" : credsPath();
}
