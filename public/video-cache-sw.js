const CACHE_NAME = "path-of-xuanzang-video-assets-v2";
const VIDEO_PATHS = new Set([
  "/videos/background.mp4",
  "/videos/optimized/Ending%20Map-1080p.mp4",
  "/videos/optimized/Station1(pt1)-1080p.mp4",
  "/videos/optimized/Station1(pt2)-1080p.mp4",
  "/videos/optimized/Station1(pt3)-1080p.mp4",
  "/videos/optimized/Station1(pt4)-1080p.mp4",
  "/videos/optimized/Station1(pt5)-1080p.mp4",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith("path-of-xuanzang-video-assets-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function respondWithCachedVideo(request, cachedResponse) {
  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) return cachedResponse;

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return cachedResponse;

  const videoBlob = await cachedResponse.blob();
  const size = videoBlob.size;
  const suffixLength = match[1] ? null : Number(match[2]);
  const start = suffixLength === null ? Number(match[1]) : Math.max(size - suffixLength, 0);
  const requestedEnd = match[2] && match[1] ? Number(match[2]) : size - 1;
  const end = Math.min(requestedEnd, size - 1);

  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const body = videoBlob.slice(start, end + 1);
  const headers = new Headers(cachedResponse.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(body.size));
  headers.delete("Content-Encoding");

  return new Response(body, { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin ||
    event.request.method !== "GET" ||
    !VIDEO_PATHS.has(url.pathname)
  ) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(`${url.origin}${url.pathname}`);
    if (cachedResponse) return respondWithCachedVideo(event.request, cachedResponse);
    return fetch(event.request);
  })());
});
