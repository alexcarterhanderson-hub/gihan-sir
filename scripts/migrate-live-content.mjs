import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const sourceArg = args.indexOf("--source");
const source = new URL(
  sourceArg >= 0 ? args[sourceArg + 1] : "https://science-in-motion.aya18293098213.chatgpt.site",
);

if (sourceArg >= 0 && !args[sourceArg + 1]) {
  throw new Error("Pass the original site's HTTPS URL after --source.");
}
if (source.protocol !== "https:") {
  throw new Error("The source site must use HTTPS.");
}

const config = JSON.parse(readFileSync(path.join(root, "wrangler.standalone.json"), "utf8"));
const database = config.d1_databases?.find((binding) => binding.binding === "DB");
const endpoint = config.vars?.IMAGEKIT_URL_ENDPOINT?.replace(/\/+$/, "");
const devVarsPath = path.join(root, ".dev.vars");
const devVars = existsSync(devVarsPath) ? readFileSync(devVarsPath, "utf8") : "";
const secretLine = devVars.split(/\r?\n/).find((line) => /^\s*SCIENCE_MEDIA\s*=/.test(line));
const imageKitKey =
  process.env.SCIENCE_MEDIA ??
  secretLine
    ?.replace(/^\s*SCIENCE_MEDIA\s*=\s*/, "")
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");
const wrangler = path.join(root, "node_modules/wrangler/bin/wrangler.js");

if (!database || !endpoint) {
  throw new Error("Configure the DB binding and ImageKit URL endpoint in wrangler.standalone.json.");
}
if (database.database_id === "00000000-0000-4000-8000-000000000000") {
  throw new Error("Set the real Cloudflare D1 database ID first.");
}
if (!existsSync(wrangler)) throw new Error("Run pnpm install first.");
if (apply && !imageKitKey) {
  throw new Error("Set SCIENCE_MEDIA in .dev.vars before applying the migration.");
}

function runWrangler(command) {
  const result = spawnSync(
    process.execPath,
    [wrangler, ...command, "--config", path.join(root, "wrangler.standalone.json")],
    { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Wrangler command failed.");
  }
  return result.stdout;
}

function parseWranglerJson(output) {
  const start = output.indexOf("[");
  if (start < 0) throw new Error("Wrangler did not return the expected JSON result.");
  return JSON.parse(output.slice(start));
}

const tableOutput = runWrangler([
  "d1",
  "execute",
  "DB",
  "--remote",
  "--json",
  "--command",
  "SELECT name FROM sqlite_master WHERE type='table' AND name='studio'",
]);
const tableResult = parseWranglerJson(tableOutput);
if (tableResult[0]?.success !== true) throw new Error("Could not inspect the target D1 database.");
if (tableResult[0]?.results?.length) {
  throw new Error(
    "Target D1 already has a studio table. Migration stopped without uploading files or changing it.",
  );
}

const contentUrl = new URL("/api/content", source);
const contentResponse = await fetch(contentUrl, { signal: AbortSignal.timeout(30000) });
if (!contentResponse.ok) {
  throw new Error(`Could not read current site content (HTTP ${contentResponse.status}).`);
}
const content = await contentResponse.json();
if (
  !content?.profile ||
  !Array.isArray(content.classes) ||
  !Array.isArray(content.albums) ||
  !content.sectionTheme ||
  !Array.isArray(content.videos)
) {
  throw new Error("The original site's content API returned an unexpected shape.");
}

const mediaIds = new Set();
function collectMedia(value) {
  if (Array.isArray(value)) {
    value.forEach(collectMedia);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collectMedia);
  } else if (typeof value === "string") {
    for (const match of value.matchAll(/\/api\/media\/([0-9a-f-]{36})(?:[?#]|$)/g)) {
      mediaIds.add(match[1]);
    }
  }
}
collectMedia(content);

async function downloadMedia(id) {
  const response = await fetch(new URL(`/api/media/${id}`, source), {
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) {
    throw new Error(`Could not download media ${id} (HTTP ${response.status}).`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const range = response.headers.get("content-range");
  const match = range?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  if (match && (Number(match[1]) !== 0 || Number(match[2]) + 1 !== Number(match[3]))) {
    throw new Error(`Media ${id} was only partially downloaded; refusing an incomplete migration.`);
  }
  return {
    bytes,
    mime: response.headers.get("content-type")?.split(";")[0] || "application/octet-stream",
  };
}

async function uploadMedia(id, file) {
  const form = new FormData();
  form.append("file", new Blob([file.bytes], { type: file.mime }), id);
  form.append("fileName", id);
  form.append("folder", "/science-with-gihan");
  form.append("useUniqueFileName", "false");
  form.append("overwriteFile", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${imageKitKey}:`).toString("base64")}` },
    body: form,
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) {
    throw new Error(`ImageKit upload failed for media ${id} (HTTP ${response.status}).`);
  }
}

const media = [];
let totalBytes = 0;
for (const id of mediaIds) {
  const file = await downloadMedia(id);
  totalBytes += file.bytes.length;
  media.push({ id, ...file });
}

console.log(
  `Source: ${source.origin}\n` +
    `Content: ${Buffer.byteLength(JSON.stringify(content))} bytes; ` +
    `${content.classes.length} classes, ${content.albums.length} albums, ` +
    `${content.videos.length} videos\n` +
    `Media: ${media.length} files; ${(totalBytes / 1024 / 1024).toFixed(2)} MiB total\n` +
    `Target: remote D1 database ${database.database_name} (${database.database_id}); ` +
    `ImageKit endpoint ${endpoint}`,
);

if (!apply) {
  console.log("\nPreview only: nothing was uploaded or written. Re-run with --apply to migrate.");
  process.exit(0);
}

for (let index = 0; index < media.length; index += 1) {
  const file = media[index];
  await uploadMedia(file.id, file);
  console.log(`Uploaded media ${index + 1}/${media.length} to ImageKit.`);
}

const temporary = mkdtempSync(path.join(tmpdir(), "science-live-migration-"));
try {
  const schema = readFileSync(path.join(root, "drizzle/0000_cooing_maestro.sql"), "utf8")
    .replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS ");
  const value = JSON.stringify(content).replaceAll("'", "''");
  const sql =
    schema +
    "\nINSERT INTO studio (id,value,expires) VALUES ('content','" +
    value +
    "',0);\n";
  const file = path.join(temporary, "migrate.sql");
  writeFileSync(file, sql);
  runWrangler(["d1", "execute", "DB", "--remote", "--file", file]);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

console.log("Live site content and media migrated. The original site was not changed.");
