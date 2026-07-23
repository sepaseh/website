import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "src", "content", "career");
const repository = process.env.CAREER_REPOSITORY ?? "sepaseh/career";
const ref = process.env.CAREER_REF ?? "main";
const apiBase = `https://api.github.com/repos/${repository}`;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "sepaseh-website-build"
};

async function fetchJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${url}`);
  }
  return response.text();
}

async function hasCachedContent() {
  try {
    const files = await readdir(outputDir, { recursive: true });
    return files.some((file) => file.endsWith(".md"));
  } catch {
    return false;
  }
}

try {
  const tree = await fetchJson(
    `${apiBase}/git/trees/${encodeURIComponent(ref)}?recursive=1`
  );

  const markdownFiles = tree.tree
    .filter(
      (item) =>
        item.type === "blob" &&
        item.path.endsWith(".md") &&
        (item.path === "README.md" ||
          item.path === "about.md" ||
          item.path === "resume.md" ||
          item.path.startsWith("experience/") ||
          item.path.startsWith("projects/"))
    )
    .map((item) => item.path);

  if (markdownFiles.length < 4) {
    throw new Error("The career repository did not contain the expected Markdown files.");
  }

  await rm(outputDir, { recursive: true, force: true });

  await Promise.all(
    markdownFiles.map(async (filePath) => {
      const destination = path.join(outputDir, filePath);
      const rawUrl = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(ref)}/${filePath
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
      const content = await fetchText(rawUrl);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, content, "utf8");
    })
  );

  console.log(`Synced ${markdownFiles.length} Markdown files from ${repository}@${ref}.`);
} catch (error) {
  if (await hasCachedContent()) {
    console.warn(`Content sync failed; using the existing local cache. ${error.message}`);
  } else {
    throw error;
  }
}
