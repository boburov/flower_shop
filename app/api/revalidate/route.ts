import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand cache revalidation for the admin bot.
 *
 * The catalogue pages are cached (see `revalidate` in app/page.tsx etc.) so
 * customers get fast responses. When an admin adds, deletes or edits something
 * from the Telegram bot, the bot calls this route so the change is visible right
 * away instead of after the cache window.
 *
 * Auth: a shared secret in REVALIDATE_SECRET, sent as `x-revalidate-secret`.
 * Without the env var set the route is disabled (501) rather than left open.
 *
 * POST /api/revalidate            -> refresh home, catalogue and sitemap
 * POST /api/revalidate?slug=rose  -> also refresh /product/rose
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 501 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  const paths = ["/", "/shop", "/sitemap.xml"];
  if (slug && /^[a-z0-9-]+$/.test(slug)) paths.push(`/product/${slug}`);

  for (const path of paths) revalidatePath(path);

  return NextResponse.json(
    { revalidated: paths, now: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
