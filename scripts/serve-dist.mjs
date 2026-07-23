import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), "dist");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4321);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  let filePath = path.join(root, decodedPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  } else if (!path.extname(filePath)) {
    filePath = path.join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    filePath = path.join(root, "404.html");
    response.statusCode = 404;
  }

  response.setHeader(
    "Content-Type",
    contentTypes[path.extname(filePath)] ?? "application/octet-stream"
  );
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Static preview running at http://${host}:${port}`);
});
