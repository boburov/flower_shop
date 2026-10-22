import { NextResponse } from "next/server";

/**
 * Protected image proxy for Telegram-hosted photos (OPTIONAL path).
 *
 * Telegram file_id values are not public URLs and getFile download links are
 * temporary, so images must be resolved server-side on each request. The bot
 * token stays on the server. Responses are cached at the edge/CDN so we don't hit
 * Telegram for every view.
 *
 * Not used when images are served from your VPS (the default/production path).
 * If you never host images on Telegram, this route simply goes unused.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: "Image proxy is not configured" }, { status: 501 });
  }

  const { fileId } = await params;
  if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
  }

  // Defaults to Telegram directly; set TELEGRAM_API_BASE to a reverse proxy
  // (e.g. a Cloudflare Worker) on hosts that cannot reach api.telegram.org.
  const apiBase =
    process.env.TELEGRAM_API_BASE?.trim().replace(/\/+$/, "") || "https://api.telegram.org";

  try {
    // 1) Resolve the (temporary) file path for this file_id.
    const metaRes = await fetch(
      `${apiBase}/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { cache: "no-store" },
    );
    const meta = (await metaRes.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    if (!meta.ok || !meta.result?.file_path) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // 2) Fetch the actual bytes.
    const fileRes = await fetch(
      `${apiBase}/file/bot${token}/${meta.result.file_path}`,
      { cache: "no-store" },
    );
    if (!fileRes.ok || !fileRes.body) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const contentType = fileRes.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache aggressively — the underlying photo is immutable for a given file_id.
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[api/images] proxy failed:", error);
    return NextResponse.json({ error: "Image proxy error" }, { status: 500 });
  }
}
