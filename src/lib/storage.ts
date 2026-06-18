import fs from "fs";
import path from "path";

const MEDIA_DIR = process.env.MEDIA_DIR ?? path.join(process.cwd(), ".media");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function put(relPath: string, buf: Buffer): void {
  const fullPath = getFullPath(relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, buf);
}

export function getFullPath(relPath: string): string {
  const resolved = path.resolve(MEDIA_DIR, relPath);
  if (!resolved.startsWith(path.resolve(MEDIA_DIR))) {
    throw new Error("Path traversal attempt blocked");
  }
  return resolved;
}

export function url(relPath: string): string {
  return `/media/${relPath}`;
}
