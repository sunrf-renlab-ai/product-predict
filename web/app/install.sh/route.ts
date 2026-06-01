// Alias: /install.sh serves the same bash installer as /install, so the
// dashboard's `curl … /install.sh | sh` command resolves (and mirrors the
// Windows /install.ps1 route). Single source of truth in ../install/route.
export { GET } from "../install/route";
export const runtime = "edge";
