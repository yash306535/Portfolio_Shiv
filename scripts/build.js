const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const staticDirectories = new Set(["images"]);
const staticExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".txt",
  ".xml",
  ".webmanifest"
]);
const ignoredEntries = new Set([
  ".git",
  ".vscode",
  "dist",
  "node_modules",
  "Portfolio-website-",
  "package.json",
  "package-lock.json",
  "netlify.toml",
  "scripts"
]);

function copyRecursive(source, destination) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const copiedEntries = [];

for (const entry of fs.readdirSync(rootDir)) {
  if (ignoredEntries.has(entry)) {
    continue;
  }

  const source = path.join(rootDir, entry);
  const destination = path.join(distDir, entry);
  const stat = fs.statSync(source);

  if (stat.isDirectory() && staticDirectories.has(entry)) {
    copyRecursive(source, destination);
    copiedEntries.push(entry);
    continue;
  }

  if (stat.isFile() && staticExtensions.has(path.extname(entry).toLowerCase())) {
    copyRecursive(source, destination);
    copiedEntries.push(entry);
  }
}

console.log(`Built ${copiedEntries.length} static entries into dist.`);
