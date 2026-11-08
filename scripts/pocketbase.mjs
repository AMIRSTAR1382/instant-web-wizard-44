#!/usr/bin/env node
/*
 * Runs the site's backend (PocketBase) on this computer for development.
 *
 *   npm run backend          download PocketBase once, then start it on http://127.0.0.1:8090
 *   npm run backend:setup    only download it
 *   npm run backend:exec -- superuser upsert you@example.com YOUR_PASSWORD
 *                            any other PocketBase command, against the local database
 *
 * The program is downloaded from the official GitHub release, checked against the release's
 * checksums.txt, and kept in node_modules/.pocketbase/ with its development database
 * (node_modules/.pocketbase/pb_data), so git, ESLint and Docker all leave it alone. A fresh
 * `npm ci` removes both; the next `npm run backend` downloads PocketBase again and starts
 * with an empty database plus the built-in communities.
 *
 * The tables, access rules and built-in communities come from pocketbase/pb_migrations;
 * server-side logic is in pocketbase/pb_hooks.
 * On the real server the Dockerfile does the same (see DEPLOY.md).
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

// Keep in step with POCKETBASE_VERSION in the Dockerfile.
const VERSION = "0.40.6";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installDir = path.join(root, "node_modules", ".pocketbase");
const dataDir = path.join(installDir, "pb_data");
const isWindows = process.platform === "win32";
const binary = path.join(installDir, isWindows ? "pocketbase.exe" : "pocketbase");

function assetName() {
  const os = { win32: "windows", darwin: "darwin", linux: "linux" }[process.platform];
  const arch = { x64: "amd64", arm64: "arm64" }[process.arch];
  if (!os || !arch) throw new Error(`No PocketBase build for ${process.platform}/${process.arch}.`);
  return `pocketbase_${VERSION}_${os}_${arch}.zip`;
}

/** curl is on Windows 10+, macOS and Linux, and it honours HTTPS_PROXY. */
function download(url, file) {
  const result = spawnSync("curl", ["-fsSL", "--retry", "2", "-o", file, url], { stdio: "inherit" });
  if (result.error || result.status !== 0) throw new Error(`Download failed: ${url}`);
}

/** Pulls one file out of a .zip archive (enough for the single program PocketBase ships). */
function extractFromZip(zip, wanted) {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("Not a zip file.");
  const entries = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);
  for (let i = 0; i < entries; i++) {
    const method = zip.readUInt16LE(offset + 10);
    const compressedSize = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localHeader = zip.readUInt32LE(offset + 42);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);
    if (name === wanted) {
      const dataStart = localHeader + 30 + zip.readUInt16LE(localHeader + 26) + zip.readUInt16LE(localHeader + 28);
      const data = zip.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return data;
      if (method === 8) return inflateRawSync(data);
      throw new Error(`Unsupported zip compression (${method}).`);
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`${wanted} is not in the archive.`);
}

function setup() {
  if (existsSync(binary)) return;
  mkdirSync(installDir, { recursive: true });
  const asset = assetName();
  const base = `https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}`;
  const zipFile = path.join(installDir, asset);
  const sumsFile = path.join(installDir, "checksums.txt");

  console.log(`Downloading PocketBase ${VERSION} (${asset})…`);
  download(`${base}/${asset}`, zipFile);
  download(`${base}/checksums.txt`, sumsFile);

  const zip = readFileSync(zipFile);
  const expected = readFileSync(sumsFile, "utf8")
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .find(([, name]) => name === asset)?.[0];
  const actual = createHash("sha256").update(zip).digest("hex");
  if (!expected || expected !== actual) {
    rmSync(zipFile, { force: true });
    throw new Error(`Checksum mismatch for ${asset}; the download was deleted. Try again.`);
  }

  writeFileSync(binary, extractFromZip(zip, path.basename(binary)));
  if (!isWindows) chmodSync(binary, 0o755);
  rmSync(zipFile, { force: true });
  rmSync(sumsFile, { force: true });
  console.log(`PocketBase is ready in ${path.relative(root, installDir)}${path.sep}`);
}

function serve(extraArgs) {
  setup();
  const args = [
    "serve",
    "--http=127.0.0.1:8090",
    `--dir=${dataDir}`,
    `--migrationsDir=${path.join(root, "pocketbase", "pb_migrations")}`,
    `--hooksDir=${path.join(root, "pocketbase", "pb_hooks")}`,
    // The built site, if there is one, so `npm run build && npm run backend` works like the server.
    `--publicDir=${path.join(root, "dist")}`,
    ...extraArgs,
  ];
  const child = spawn(binary, args, { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}

const [command = "serve", ...rest] = process.argv.slice(2);
try {
  if (command === "setup") setup();
  else if (command === "serve") serve(rest);
  else if (command === "exec") {
    setup();
    const result = spawnSync(binary, [...rest, `--dir=${dataDir}`], { stdio: "inherit" });
    process.exit(result.status ?? 0);
  } else throw new Error(`Unknown command "${command}". Use setup, serve or exec.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
