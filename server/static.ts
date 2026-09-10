import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, resolve, sep } from "node:path";

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

export async function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  directory: string,
): Promise<boolean> {
  if (!["GET", "HEAD"].includes(req.method || "")) return false;
  let pathname: string;
  try {
    pathname = decodeURIComponent(
      new URL(req.url || "/", "http://local").pathname,
    );
  } catch {
    return false;
  }
  if (
    pathname.startsWith("/api/") ||
    pathname.includes("\0") ||
    pathname.includes("\\")
  )
    return false;
  const root = resolve(directory);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep)) return false;
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return false;
  res.setHeader(
    "Content-Type",
    mime[extname(file)] || "application/octet-stream",
  );
  res.setHeader("Content-Length", info.size);
  res.setHeader(
    "Cache-Control",
    pathname.startsWith("/assets/")
      ? "public,max-age=31536000,immutable"
      : "no-cache",
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  );
  res.writeHead(200);
  if (req.method === "HEAD") {
    res.end();
  } else {
    const stream = createReadStream(file);
    stream.on("error", () => res.destroy());
    res.on("close", () => stream.destroy());
    stream.pipe(res);
  }
  return true;
}
