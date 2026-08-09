import { createReadStream, promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../../out", import.meta.url)));
const rootPrefix = `${root}${sep}`;
const realRoot = await fs.realpath(root);
const realRootPrefix = `${realRoot}${sep}`;
const configuredPort = Number.parseInt(process.env.PORT ?? "4175", 10);

if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function safeFilePath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = resolve(root, relativePath);

  if (candidate !== root && !candidate.startsWith(rootPrefix)) {
    throw new Error("Requested path leaves the static export root");
  }

  return candidate;
}

function parseRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader ?? "");
  if (!match) return null;

  const requestedStart = match[1] === "" ? null : Number.parseInt(match[1], 10);
  const requestedEnd = match[2] === "" ? null : Number.parseInt(match[2], 10);
  const start = requestedStart ?? Math.max(0, size - (requestedEnd ?? 0));
  const end = Math.min(requestedEnd ?? size - 1, size - 1);

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end) {
    return null;
  }

  return { start, end };
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const candidatePath = safeFilePath(request.url ?? "/");
    const filePath = await fs.realpath(candidatePath);
    if (filePath !== realRoot && !filePath.startsWith(realRootPrefix)) {
      throw new Error("Resolved path leaves the static export root");
    }
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) throw new Error("Requested path is not a file");

    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream",
    };
    const range = parseRange(request.headers.range, stats.size);

    if (request.headers.range && !range) {
      response.writeHead(416, { ...headers, "Content-Range": `bytes */${stats.size}` });
      response.end();
      return;
    }

    if (range) {
      response.writeHead(206, {
        ...headers,
        "Content-Length": range.end - range.start + 1,
        "Content-Range": `bytes ${range.start}-${range.end}/${stats.size}`,
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath, range).pipe(response);
      return;
    }

    response.writeHead(200, { ...headers, "Content-Length": stats.size });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(configuredPort, "127.0.0.1", () => {
  process.stdout.write(`Responsive test server listening on ${configuredPort}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
