// One-line Windows installer for pp.
//   irm https://product-predict.renlab.ai/install.ps1 | iex
//
// PowerShell counterpart of /install (the bash script). It:
//  - checks git + node 20+ + npm exist
//  - clones (or git-pulls) sunrf-renlab-ai/product-predict to %USERPROFILE%\.pp\src
//  - npm-installs deps (postinstall downloads Chromium)
//  - writes pp.cmd / pp.ps1 launcher shims into %USERPROFILE%\.pp\bin
//  - adds that bin dir to the user PATH (no admin needed)
//
// Plain text — `irm | iex` must see only PowerShell, no HTML/framework noise.
// NOTE: the script below is authored WITHOUT backticks (PowerShell's escape
// char) so it can live inside a JS template literal untouched.

import { NextResponse } from "next/server";

export const runtime = "edge";

const SCRIPT = `# pp installer (Windows) - https://product-predict.renlab.ai/install.ps1
$ErrorActionPreference = 'Stop'

$ppDir = if ($env:PP_INSTALL_DIR) { $env:PP_INSTALL_DIR } else { Join-Path $env:USERPROFILE '.pp\\src' }
$ppBin = if ($env:PP_BIN_DIR)     { $env:PP_BIN_DIR }     else { Join-Path $env:USERPROFILE '.pp\\bin' }
$repo  = 'https://github.com/sunrf-renlab-ai/product-predict.git'

Write-Host ''
Write-Host '  pp installer (Windows)'
Write-Host '  ----------------------'
Write-Host ''

# 1. Prerequisites
foreach ($c in @('git','node','npm')) {
  if (-not (Get-Command $c -ErrorAction SilentlyContinue)) {
    throw ($c + ' not found. Install it first (Node.js >= 20 from https://nodejs.org).')
  }
}
$nodeMajor = [int](node -p 'process.versions.node.split(".")[0]')
if ($nodeMajor -lt 20) { throw ('Node ' + (node -v) + ' is too old. pp needs Node >= 20.') }
Write-Host ('  ok  prereqs: git, node ' + (node -v) + ', npm')

# 2. Clone or update
if (Test-Path (Join-Path $ppDir '.git')) {
  Write-Host ('  updating existing install at ' + $ppDir)
  git -C $ppDir fetch --quiet origin main
  git -C $ppDir reset --hard origin/main | Out-Null
} else {
  Write-Host ('  cloning into ' + $ppDir)
  New-Item -ItemType Directory -Force -Path (Split-Path $ppDir) | Out-Null
  git clone --quiet --depth 1 $repo $ppDir
}

# 3. Install deps (postinstall downloads Chromium ~150MB, one-time)
Write-Host '  installing dependencies (one-time Chromium download ~150MB) ...'
Push-Location (Join-Path $ppDir 'pp')
try { npm install --no-audit --no-fund --silent } finally { Pop-Location }

# 4. Launcher shims on a bin dir
New-Item -ItemType Directory -Force -Path $ppBin | Out-Null
$entry = Join-Path $ppDir 'pp\\bin\\pp'
Set-Content -Path (Join-Path $ppBin 'pp.cmd') -Encoding ascii -Value @('@echo off', ('node "' + $entry + '" %*'))
Set-Content -Path (Join-Path $ppBin 'pp.ps1') -Encoding ascii -Value ('node "' + $entry + '" $args')
Write-Host ('  ok  installed launcher at ' + (Join-Path $ppBin 'pp.cmd'))

# 5. PATH (current user; no admin required)
$userPath = [Environment]::GetEnvironmentVariable('Path','User')
if (-not $userPath) { $userPath = '' }
$segs = @($userPath -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
if ($segs -notcontains $ppBin) {
  [Environment]::SetEnvironmentVariable('Path', ($userPath.TrimEnd(';') + ';' + $ppBin), 'User')
  $env:Path = $env:Path + ';' + $ppBin
  Write-Host ('  ok  added ' + $ppBin + ' to your user PATH (open a NEW terminal to use pp)')
} else {
  Write-Host ('  ok  ' + $ppBin + ' already on PATH')
}

Write-Host ''
Write-Host '  Installed. Authenticate, then run:'
Write-Host '    pp login --token <your token from product-predict.renlab.ai/dashboard>'
Write-Host '    pp run http://localhost:3000'
Write-Host ''

# Print the full command manual from the freshly installed binary.
& node $entry
`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
