/**
 * Telegram Bot API reverse proxy — Cloudflare Worker.
 *
 * Why: some hosting networks (e.g. in Uzbekistan) block outbound traffic to
 * api.telegram.org, so a bot running there cannot long-poll (getUpdates) or
 * send messages, and the website's image proxy cannot fetch Telegram photos.
 * Cloudflare's edge CAN reach Telegram, and *.workers.dev is reachable from
 * those networks — so the VPS talks to this Worker, and the Worker talks to
 * Telegram.
 *
 *   VPS bot / web  ->  <name>.workers.dev  ->  api.telegram.org
 *
 * It transparently forwards BOTH:
 *   - the Bot API:   /bot<token>/<method>
 *   - file downloads:/file/bot<token>/<path>
 *
 * Point the app at it by setting TELEGRAM_API_BASE=https://<name>.workers.dev
 * (no trailing slash) in the VPS environment for both the web app and the bot.
 *
 * Abuse guard: only requests for the configured bot id are proxied, so the URL
 * cannot be used as a generic open proxy to Telegram. The bot *id* (the number
 * before the ":") does not change when you rotate (revoke) the token, so this
 * keeps working across token rotation. Set ALLOWED_BOT_ID in wrangler.toml.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const botId = (env && env.ALLOWED_BOT_ID ? String(env.ALLOWED_BOT_ID) : "").trim();
    if (botId) {
      const allowed =
        path.startsWith(`/bot${botId}:`) || path.startsWith(`/file/bot${botId}:`);
      if (!allowed) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // Only the Bot API surface — nothing else on api.telegram.org.
    if (!(path.startsWith("/bot") || path.startsWith("/file/bot"))) {
      return new Response("Not found", { status: 404 });
    }

    const target = "https://api.telegram.org" + path + url.search;

    const init = {
      method: request.method,
      headers: request.headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "follow",
    };

    return fetch(target, init);
  },
};
