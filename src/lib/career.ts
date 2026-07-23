import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

const contentRoot = path.resolve(process.cwd(), "src", "content", "career");

export type CareerEntry = {
  slug: string;
  title: string;
  description: string;
  html: string;
  role?: string;
  employmentType?: string;
  duration?: string;
  stack: string[];
};

const experienceOrder = [
  "bitwatt",
  "veerasense",
  "hoomaan",
  "sp-soft",
  "profile-digital",
  "commercial-trade-promotion",
  "kaspid"
];

const projectOrder = [
  "multi-signature-crypto-wallet-ecosystem",
  "digital-pathology-education-and-interactive-examination-platform",
  "multi-vendor-tour-travel-reservation-platform",
  "location-based-supermarket-retail-platform",
  "professional-digital-identity-and-networking-platform",
  "hospitality-guest-experience-and-iptv-platform",
  "esports-community-and-commerce-platform",
  "custom-furniture-product-discovery-platform",
  "mashhad-city-identity-visitor-information-platform",
  "kids-family-coupon-marketplace-and-ticket-validation-platform",
  "exhibition-services-marketplace-operations-platform"
];

const featuredProjectSlugs = [
  "multi-signature-crypto-wallet-ecosystem",
  "professional-digital-identity-and-networking-platform",
  "digital-pathology-education-and-interactive-examination-platform",
  "hospitality-guest-experience-and-iptv-platform"
];

function readMarkdown(relativePath: string) {
  return readFileSync(path.join(contentRoot, relativePath), "utf8");
}

function rewriteLinks(markdown: string) {
  return markdown
    .replace(/\]\(experience\/([^)]+)\.md\)/g, "](/experience/$1)")
    .replace(/\]\(projects\/([^)]+)\.md\)/g, "](/projects/$1)")
    .replace(/\]\(\.\.\/experience\/([^)]+)\.md\)/g, "](/experience/$1)")
    .replace(/\]\(\.\.\/projects\/([^)]+)\.md\)/g, "](/projects/$1)")
    .replace(/\]\(about\.md\)/g, "](/about)")
    .replace(/\]\(resume\.md\)/g, "](/resume)");
}

function render(markdown: string) {
  return marked.parse(rewriteLinks(markdown), {
    gfm: true,
    breaks: false
  }) as string;
}

function titleFrom(markdown: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Untitled";
}

function fieldFrom(markdown: string, label: string) {
  return markdown
    .match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, "i"))?.[1]
    ?.trim();
}

function sectionFrom(markdown: string, heading: string) {
  const match = markdown.match(
    new RegExp(
      `^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`,
      "im"
    )
  );
  return match?.[1]?.trim() ?? "";
}

function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/(^|\n)\s*-\s+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraph(markdown: string) {
  const overview = sectionFrom(markdown, "Overview");
  const source = overview || sectionFrom(markdown, "Work Context") || markdown;
  return (
    source
      .split(/\n\s*\n/)
      .map(plainText)
      .find((paragraph) => paragraph.length > 45) ?? ""
  );
}

function stackFrom(markdown: string) {
  const section = sectionFrom(markdown, "Technology Stack");
  return section
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
}

function toEntry(directory: "experience" | "projects", slug: string): CareerEntry {
  const markdown = readMarkdown(`${directory}/${slug}.md`);
  return {
    slug,
    title: titleFrom(markdown),
    description: firstParagraph(markdown),
    html: render(markdown),
    role: fieldFrom(markdown, "Role"),
    employmentType: fieldFrom(markdown, "Employment Type"),
    duration: fieldFrom(markdown, "Duration"),
    stack: stackFrom(markdown)
  };
}

function existingSlugs(directory: "experience" | "projects") {
  return new Set(
    readdirSync(path.join(contentRoot, directory))
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""))
  );
}

export function getExperiences() {
  const available = existingSlugs("experience");
  return experienceOrder
    .filter((slug) => available.has(slug))
    .map((slug) => toEntry("experience", slug));
}

export function getProjects() {
  const available = existingSlugs("projects");
  return projectOrder
    .filter((slug) => available.has(slug))
    .map((slug) => toEntry("projects", slug));
}

export function getFeaturedProjects() {
  const projects = getProjects();
  return featuredProjectSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is CareerEntry => Boolean(project));
}

export function getDocument(name: "about" | "resume") {
  const markdown = readMarkdown(`${name}.md`);
  return {
    title: titleFrom(markdown),
    html: render(markdown)
  };
}
