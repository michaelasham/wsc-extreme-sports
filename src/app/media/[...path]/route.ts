import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const MEDIA_DIR = process.env.MEDIA_DIR ?? path.join(process.cwd(), ".media");

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await ctx.params;
  const relPath = segments.join("/");

  // Guard against path traversal
  const resolved = path.resolve(MEDIA_DIR, relPath);
  if (!resolved.startsWith(path.resolve(MEDIA_DIR))) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(resolved)) {
    return new Response("Not found", { status: 404 });
  }

  const buf = fs.readFileSync(resolved);
  const ext = path.extname(relPath).slice(1).toLowerCase();
  const mimeMap: Record<string, string> = {
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  const contentType = mimeMap[ext] ?? "application/octet-stream";

  return new Response(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
