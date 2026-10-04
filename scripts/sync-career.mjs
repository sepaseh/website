import { access, cp, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "src/content/career");
const downloads = path.join(root, "public/downloads");
const repository = process.env.CAREER_REPOSITORY ?? "sepaseh/career";
const ref = process.env.CAREER_REF ?? "main";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "sepaseh-website-build" };
const documents = new Set(["README.md", "about.md", "resume.md", "skills.md", "education.md"]);
function wanted(file) {
  const localized = file.replace(/^fa\//, "");
  return file.endsWith(".md") && (documents.has(localized) || localized.startsWith("experience/") || localized.startsWith("projects/")) || /^output\/pdf\/mahdi-sepaseh-resume-ats-(en|fa)\.pdf$/.test(file);
}
async function fetchResource(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${url}`);
  return response;
}
async function exists(file) { try { await access(file); return true; } catch { return false; } }
const sibling = path.resolve(root, "../career");
const local = process.env.CAREER_SOURCE_DIR ? path.resolve(process.env.CAREER_SOURCE_DIR) : !process.env.CAREER_REPOSITORY && !process.env.CAREER_REF && await exists(path.join(sibling, "fa/about.md")) ? sibling : null;
const staged = path.join(root, ".career-sync-stage");
try {
  let files;
  if (local) files = (await readdir(local, { recursive: true })).map(file => file.replaceAll("\\", "/")).filter(wanted);
  else {
    const tree = await (await fetchResource(`https://api.github.com/repos/${repository}/git/trees/${encodeURIComponent(ref)}?recursive=1`)).json();
    files = tree.tree.filter(item => item.type === "blob" && wanted(item.path)).map(item => item.path);
  }
  for (const language of ["", "fa/"]) for (const name of ["about.md", "resume.md", "skills.md", "education.md", "experience/bitwatt.md", "projects/multi-signature-crypto-wallet-ecosystem.md"]) {
    if (!files.includes(language + name)) throw new Error(`Missing required content: ${language}${name}`);
  }
  await mkdir(staged, { recursive: true });
  await Promise.all(files.map(async file => {
    const destination = path.join(staged, file.startsWith("output/pdf/") ? `downloads/${path.basename(file)}` : `content/${file}`);
    const content = local ? await readFile(path.join(local, file)) : Buffer.from(await (await fetchResource(`https://raw.githubusercontent.com/${repository}/${encodeURIComponent(ref)}/${file.split("/").map(encodeURIComponent).join("/")}`)).arrayBuffer());
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }));
  // Replace the cache only after every source file has been read successfully.
  await rm(outputDir, { recursive: true, force: true });
  await rename(path.join(staged, "content"), outputDir);
  await mkdir(downloads, { recursive: true });
  if (await exists(path.join(staged, "downloads"))) await cp(path.join(staged, "downloads"), downloads, { recursive: true });
  console.log(`Synced ${files.length} career files from ${local ?? `${repository}@${ref}`}.`);
} catch (error) {
  if (local || !await exists(path.join(outputDir, "fa/about.md"))) throw error;
  console.warn(`Content sync failed; using the existing bilingual cache. ${error.message}`);
} finally { await rm(staged, { recursive: true, force: true }); }
