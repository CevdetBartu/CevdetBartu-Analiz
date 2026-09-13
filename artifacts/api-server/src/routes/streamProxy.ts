import { Router, type IRouter } from "express";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const router: IRouter = Router();

/**
 * HLS Stream Proxy & Header Spoofing Endpoint
 * Bypasses X-Frame-Options and Referer / Origin restrictions on third-party live stream streams.
 * Usage: GET /api/stream-proxy?url=https://target-stream-server.com/live.m3u8
 */
router.get("/stream-proxy", (req, res): void => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    res.status(400).send("Target stream URL is required");
    return;
  }

  try {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === "https:" ? https : http;

    const requestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": `${parsed.protocol}//${parsed.hostname}/`,
        "Origin": `${parsed.protocol}//${parsed.hostname}`,
        "Accept": "*/*",
      },
      rejectUnauthorized: false
    };

    const proxyReq = client.request(requestOptions, (proxyRes) => {
      // Set CORS Headers to allow frontend Hls.js playback
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");

      if (targetUrl.includes(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (targetUrl.includes(".ts")) {
        res.setHeader("Content-Type", "video/MP2T");
      } else if (proxyRes.headers["content-type"]) {
        res.setHeader("Content-Type", proxyRes.headers["content-type"]);
      }

      res.status(proxyRes.statusCode || 200);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Stream Proxy error:", err);
      if (!res.headersSent) {
        res.status(502).send("Stream Proxy connection failed");
      }
    });

    proxyReq.end();
  } catch (e: any) {
    res.status(500).send(`Invalid URL: ${e.message}`);
  }
});

export default router;
