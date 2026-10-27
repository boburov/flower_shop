/**
 * Bloomé admin bot.
 *
 * A standalone Telegram bot that lets authorized admins manage the catalogue from
 * Telegram: add products, delete products, and set the home-screen location.
 * Everything is written to the database, so the website updates immediately.
 *
 * Run (separate from the web app — a long-running Node process, not serverless):
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_ADMIN_CHAT_ID=... DATABASE_URL=... npm run admin:bot
 *
 * Security:
 *   - Only chat ids in TELEGRAM_ADMIN_CHAT_ID (comma-separated) may use it.
 *     Leave it empty, message the bot, and it replies with your chat id to add.
 *   - TELEGRAM_BOT_TOKEN is a server-only secret. Never commit it.
 *
 * Commands are registered with Telegram (setMyCommands) so they appear as
 * suggestions in the "/" menu.
 */
import { PrismaClient } from "@prisma/client";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_CHAT_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Base URL for the Telegram Bot API. Defaults to Telegram directly; set
// TELEGRAM_API_BASE to a reverse proxy (e.g. a Cloudflare Worker) on hosts that
// cannot reach api.telegram.org — see cloudflare/README.md.
const TELEGRAM_DIRECT = "https://api.telegram.org";
const API_BASE = process.env.TELEGRAM_API_BASE?.trim().replace(/\/+$/, "") || TELEGRAM_DIRECT;
// Retries alternate over these. Keeping the direct host as a second base means a
// relay that is down, rate-limited or over its quota no longer takes the bot with it.
const API_BASES = API_BASE === TELEGRAM_DIRECT ? [TELEGRAM_DIRECT] : [API_BASE, TELEGRAM_DIRECT];
const prisma = new PrismaClient();

// Website cache revalidation. The site caches catalogue pages, so after a change
// we ask it to refresh immediately instead of waiting for the cache to expire.
const SITE_URL = process.env.SITE_URL?.trim().replace(/\/+$/, "") || "http://127.0.0.1:3000";
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET?.trim();

/** Best-effort: ask the website to drop its cached catalogue pages. */
async function revalidateSite(slug?: string): Promise<void> {
  if (!REVALIDATE_SECRET) return;
  const url = `${SITE_URL}/api/revalidate${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-revalidate-secret": REVALIDATE_SECRET },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("revalidate failed:", res.status, await res.text().catch(() => ""));
  } catch (error) {
    // Not fatal: the pages still refresh on their own revalidate window.
    console.error("revalidate request failed:", (error as Error).message);
  }
}

const LOCATION_CITY_KEY = "location_city";
const LOCATION_AREA_KEY = "location_area";
const LOCATION_MAPS_KEY = "location_maps";

const COMMANDS = [
  { command: "add", description: "Yangi mahsulot qo'shish" },
  { command: "list", description: "Mahsulotlar ro'yxati" },
  { command: "delete", description: "Mahsulotni o'chirish" },
  { command: "location", description: "Do'kon manzilini o'zgartirish" },
  { command: "confirm", description: "Yangi mahsulotni tasdiqlash" },
  { command: "cancel", description: "Joriy amalni bekor qilish" },
  { command: "id", description: "Chat id'ni ko'rsatish" },
];

function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.length > 0 && !/USER:PASSWORD|HOST(-pooler)?\.REGION/.test(url);
}

// ---- Telegram API helpers --------------------------------------------------

async function tgOnce<T>(base: string, method: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${base}/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await res.text();
  let json: { ok: boolean; result?: T; description?: string };
  try {
    json = JSON.parse(body);
  } catch {
    // A proxy that is down/over quota answers with an HTML error page. Surface
    // that as a retryable transport error rather than a confusing JSON error.
    throw new Error(`${method}: non-JSON response (HTTP ${res.status}) from ${base}`);
  }
  if (!json.ok) throw new Error(json.description ?? `${method} failed`);
  return json.result as T;
}

/**
 * Call the Telegram Bot API, retrying across transport failures.
 *
 * Calls are retried with a short backoff, and each retry alternates between the
 * configured API bases (a relay plus api.telegram.org, when they differ). The
 * network between this VPS and Telegram drops requests intermittently, and the
 * previous single-shot version turned every such blip into a lost reply: the
 * admin's step prompt never arrived and the add flow looked dead.
 */
async function tg<T = unknown>(
  method: string,
  params: Record<string, unknown>,
  attempts = 3,
): Promise<T> {
  let lastError: Error = new Error(`${method} failed`);
  for (let i = 0; i < attempts; i++) {
    const base = API_BASES[i % API_BASES.length];
    try {
      return await tgOnce<T>(base, method, params);
    } catch (error) {
      lastError = error as Error;
      // A rejection from Telegram itself (not transport) will not fix itself.
      if (/^(Bad Request|Unauthorized|Forbidden|Conflict)/i.test(lastError.message)) break;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError;
}

/**
 * Send a message to an admin. Unlike a plain `tg` call this never rejects, but it
 * does report failure, so a dropped prompt is visible in the logs instead of
 * silently stalling the conversation.
 */
async function send(chatId: number | string, text: string): Promise<boolean> {
  try {
    await tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" }, 4);
    return true;
  } catch (error) {
    console.error(`sendMessage to ${chatId} failed after retries:`, (error as Error).message);
    return false;
  }
}

// ---- Conversation state (in-memory) ---------------------------------------

type Flow = "add" | "location" | "delete";
interface Draft {
  name?: string;
  price?: number;
  categorySlug?: string;
  categoryName?: string;
  size?: string | null;
  description?: string;
  imageUrl?: string | null;
  featured?: boolean;
  city?: string;
  area?: string;
}
interface Session {
  flow: Flow;
  step: string;
  draft: Draft;
  deleteIds?: string[];
}
const sessions = new Map<number, Session>();

// ---- Helpers ---------------------------------------------------------------

const YES = new Set(["ha", "ha.", "yes", "y", "ha ✅", "✅"]);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ʻʼ'‘’`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "mahsulot";
  let slug = root;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) slug = `${root}-${n++}`;
  return slug;
}

function fmtPrice(p: number) {
  return p.toLocaleString("en-US").replace(/,/g, " ");
}

function isAdmin(chatId: number): boolean {
  return ADMIN_IDS.includes(String(chatId));
}

function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

function menuText(): string {
  const lines = COMMANDS.map((c) => `/${c.command} — ${c.description}`);
  return `👋 <b>Bloomé admin bot</b>\n\n${lines.join("\n")}`;
}

function draftSummary(d: Draft): string {
  return [
    "<b>Yangi mahsulot</b>",
    `Nomi: ${d.name}`,
    `Narx: ${fmtPrice(d.price ?? 0)} UZS`,
    `Kategoriya: ${d.categoryName}`,
    `O'lcham: ${d.size ?? "—"}`,
    `Tavsif: ${d.description}`,
    `Rasm: ${d.imageUrl ? "✅ qo'shildi" : "—"}`,
    `Bosh sahifada: ${d.featured ? "✅ ha" : "yo'q"}`,
    "",
    "Tasdiqlaysizmi? /confirm yoki /cancel",
  ].join("\n");
}

// ---- Flow starters ---------------------------------------------------------

async function startAdd(chatId: number) {
  sessions.set(chatId, { flow: "add", step: "name", draft: {} });
  await send(chatId, "🌸 Yangi mahsulot qo'shamiz.\n\n1/7 — Mahsulot <b>nomini</b> yuboring:");
}

async function startLocation(chatId: number) {
  sessions.set(chatId, { flow: "location", step: "city", draft: {} });
  await send(chatId, "📍 Do'kon manzilini o'zgartiramiz.\n\n1/3 — <b>Shahar</b> nomini yuboring (masalan Toshkent):");
}

async function startDelete(chatId: number) {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  if (products.length === 0) return send(chatId, "O'chirish uchun mahsulot yo'q.");
  const ids = products.map((p) => p.id);
  sessions.set(chatId, { flow: "delete", step: "pick", draft: {}, deleteIds: ids });
  const lines = products.map((p, i) => `${i + 1}. ${p.name} — ${fmtPrice(p.price)} UZS`);
  await send(chatId, `🗑 O'chirish uchun <b>raqam</b> yuboring (yoki /cancel):\n\n${lines.join("\n")}`);
}

// ---- Command + flow dispatch ----------------------------------------------

async function promptCategory(chatId: number) {
  const cats = await listCategories();
  const list = cats.map((c, i) => `${i + 1}. ${c.name}`).join("\n");
  await send(
    chatId,
    `3/7 — <b>Kategoriya</b>ni tanlang (raqam) yoki yangi kategoriya nomini yozing:\n\n${list}`,
  );
}

async function handleText(chatId: number, text: string) {
  const t = text.trim();
  const session = sessions.get(chatId);

  // Global commands (work any time)
  if (t === "/start" || t === "/menu") return send(chatId, menuText());
  if (t === "/id") return send(chatId, `Sizning chat id: <code>${chatId}</code>`);
  if (t === "/cancel") {
    sessions.delete(chatId);
    return send(chatId, "Bekor qilindi.");
  }
  if (t === "/list") {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { category: true },
    });
    if (products.length === 0) return send(chatId, "Hozircha mahsulot yo'q.");
    const lines = products.map((p) => `• ${p.name} — ${fmtPrice(p.price)} UZS (${p.category.name})`);
    return send(chatId, `<b>Mahsulotlar:</b>\n${lines.join("\n")}`);
  }
  if (t === "/add") return startAdd(chatId);
  if (t === "/location") return startLocation(chatId);
  if (t === "/delete") return startDelete(chatId);

  if (!session) {
    // Drafts live in memory only, so a bot restart loses an in-progress /add.
    // Say so, rather than answering an answer with a menu prompt.
    if (!t.startsWith("/")) {
      return send(
        chatId,
        "Hozir hech qanday amal boshlanmagan (bot qayta ishga tushgan bo'lishi mumkin).\n" +
          "Mahsulot qo'shish uchun /add yuboring.",
      );
    }
    return send(chatId, `Noma'lum buyruq.\n\n${menuText()}`);
  }

  if (session.flow === "location") return handleLocationStep(chatId, session, t);
  if (session.flow === "delete") return handleDeleteStep(chatId, session, t);
  return handleAddStep(chatId, session, t);
}

async function setSetting(key: string, value: string) {
  return prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

async function handleLocationStep(chatId: number, s: Session, t: string) {
  if (s.step === "city") {
    s.draft.city = t;
    s.step = "area";
    return send(chatId, "2/3 — <b>Tuman yoki qo'shimcha manzil</b>ni yuboring (yoki /skip):");
  }
  if (s.step === "area") {
    s.draft.area = t === "/skip" ? "" : t;
    s.step = "maps";
    return send(
      chatId,
      "3/3 — <b>Google Maps havolasi</b> yoki <b>koordinata</b> (masalan 41.311,69.279) yuboring.\n" +
        "Aniq joy kerak bo'lmasa /skip — manzil matni bo'yicha qidiradi:",
    );
  }
  // maps
  const maps = t === "/skip" ? "" : t;
  await setSetting(LOCATION_CITY_KEY, s.draft.city ?? "");
  await setSetting(LOCATION_AREA_KEY, s.draft.area ?? "");
  await setSetting(LOCATION_MAPS_KEY, maps);
  await revalidateSite();
  sessions.delete(chatId);
  const tail = s.draft.area ? " · " + s.draft.area : "";
  return send(
    chatId,
    `✅ Manzil yangilandi: <b>${s.draft.city}${tail}</b>\n` +
      (maps ? "📍 Google Maps joyi saqlandi." : "📍 Maps manzil matni bo'yicha ochiladi."),
  );
}

async function handleDeleteStep(chatId: number, s: Session, t: string) {
  const num = parseInt(t, 10);
  const id = Number.isFinite(num) ? s.deleteIds?.[num - 1] : undefined;
  if (!id) return send(chatId, "Noto'g'ri raqam. Ro'yxatdan raqam yuboring yoki /cancel.");
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  await revalidateSite(product?.slug);
  sessions.delete(chatId);
  return send(chatId, `🗑 <b>${product?.name ?? "Mahsulot"}</b> o'chirildi.`);
}

async function handleAddStep(chatId: number, s: Session, t: string) {
  switch (s.step) {
    case "name":
      s.draft.name = t;
      s.step = "price";
      return send(chatId, "2/7 — <b>Narxni</b> UZS'da yuboring (faqat raqam, masalan 350000):");

    case "price": {
      const price = parseInt(t.replace(/[\s.,]/g, ""), 10);
      if (!Number.isFinite(price) || price <= 0) {
        return send(chatId, "Narx noto'g'ri. Faqat raqam yuboring, masalan 350000:");
      }
      s.draft.price = price;
      s.step = "category";
      return promptCategory(chatId);
    }

    case "category": {
      const cats = await listCategories();
      const num = parseInt(t, 10);
      let chosen = Number.isFinite(num) ? cats[num - 1] : undefined;
      if (!chosen) {
        const base = slugify(t);
        let slug = base || "kategoriya";
        let n = 2;
        while (await prisma.category.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
        chosen = await prisma.category.create({ data: { name: t, slug } });
      }
      s.draft.categorySlug = chosen.slug;
      s.draft.categoryName = chosen.name;
      s.step = "size";
      return send(chatId, "4/7 — <b>O'lcham</b> (masalan 55-67 sm). Yo'q bo'lsa /skip:");
    }

    case "size":
      s.draft.size = t === "/skip" ? null : t;
      s.step = "description";
      return send(chatId, "5/7 — <b>Tavsif</b> yuboring:");

    case "description":
      s.draft.description = t;
      s.step = "photo";
      return send(chatId, "6/7 — Mahsulot <b>rasmini</b> yuboring. Rasm bo'lmasa /skip:");

    case "photo":
      if (t === "/skip") {
        s.draft.imageUrl = null;
        s.step = "featured";
        return send(chatId, "7/7 — Bosh sahifada ko'rsatilsinmi? (ha / yo'q)");
      }
      return send(chatId, "Iltimos, rasm yuboring yoki /skip yozing.");

    case "featured":
      s.draft.featured = YES.has(t.toLowerCase());
      s.step = "confirm";
      return send(chatId, draftSummary(s.draft));

    case "confirm":
      // Accept a typed "ha" too — admins reply in words far more often than they
      // tap the /confirm link, and a rejected confirmation used to strand the draft.
      if (t === "/confirm" || YES.has(t.toLowerCase())) return saveProduct(chatId, s.draft);
      if (t.toLowerCase().startsWith("yo")) {
        sessions.delete(chatId);
        return send(chatId, "Bekor qilindi. Qaytadan: /add");
      }
      return send(chatId, "Tasdiqlash uchun <b>/confirm</b> (yoki \"ha\"), bekor qilish uchun /cancel.");
  }
}

async function handlePhoto(chatId: number, fileId: string) {
  const s = sessions.get(chatId);
  if (!s || s.flow !== "add" || s.step !== "photo") {
    return send(chatId, "Rasmni qabul qildim, ammo hozir rasm bosqichida emasmiz. /add bilan boshlang.");
  }
  s.draft.imageUrl = `/api/images/${fileId}`;
  s.step = "featured";
  return send(chatId, "🖼 Rasm qabul qilindi.\n\n7/7 — Bosh sahifada ko'rsatilsinmi? (ha / yo'q)");
}

async function saveProduct(chatId: number, draft: Draft) {
  if (!draft.name || !draft.price || !draft.categorySlug || !draft.description) {
    sessions.delete(chatId);
    return send(chatId, "Ma'lumot to'liq emas. /add bilan qaytadan boshlang.");
  }
  const category = await prisma.category.findUnique({ where: { slug: draft.categorySlug } });
  if (!category) {
    sessions.delete(chatId);
    return send(chatId, "Kategoriya topilmadi. /add bilan qaytadan boshlang.");
  }

  const slug = await uniqueSlug(slugify(draft.name));
  await prisma.product.create({
    data: {
      slug,
      name: draft.name,
      description: draft.description,
      price: draft.price,
      currency: "UZS",
      imageUrl: draft.imageUrl ?? null,
      size: draft.size ?? null,
      // "Show on home" marks it featured + bestseller so it reaches the hero.
      isFeatured: draft.featured ?? false,
      isBestseller: draft.featured ?? false,
      isAvailable: true,
      popularity: draft.featured ? 50 : 0,
      categoryId: category.id,
    },
  });

  await revalidateSite(slug);
  sessions.delete(chatId);
  return send(
    chatId,
    `✅ <b>${draft.name}</b> qo'shildi!\nSahifa: /product/${slug}\n` +
      `Jami mahsulot: ${await prisma.product.count()}\n\nYana: /add`,
  );
}

// ---- Update dispatch -------------------------------------------------------

interface Update {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
    caption?: string;
    photo?: { file_id: string }[];
    document?: { file_id: string; mime_type?: string };
  };
}

async function handleUpdate(u: Update) {
  const msg = u.message;
  if (!msg) return;
  const chatId = msg.chat.id;

  if (!isAdmin(chatId)) {
    const hint = ADMIN_IDS.length === 0 ? "Admin bot hali sozlanmagan." : "Sizda ruxsat yo'q.";
    return send(
      chatId,
      `⛔️ ${hint}\nChat id'ingiz: <code>${chatId}</code>\nUni TELEGRAM_ADMIN_CHAT_ID ga qo'shing.`,
    );
  }

  try {
    if (msg.photo && msg.photo.length > 0) {
      return await handlePhoto(chatId, msg.photo[msg.photo.length - 1].file_id);
    }
    // A photo sent as a file ("send without compression") arrives as a document,
    // not a photo. Accept it, instead of ignoring the message entirely.
    if (msg.document?.mime_type?.startsWith("image/")) {
      return await handlePhoto(chatId, msg.document.file_id);
    }
    const text = msg.text ?? msg.caption;
    if (typeof text === "string") return await handleText(chatId, text);
    // Anything else (sticker, voice, video, contact...) used to get no reply at
    // all, which looked exactly like the bot being down.
    return await send(
      chatId,
      "Bu turdagi xabarni qabul qila olmayman. Matn yoki rasm yuboring. Buyruqlar: /menu",
    );
  } catch (error) {
    console.error("handleUpdate error:", error);
    return send(chatId, "Xatolik yuz berdi. /cancel qilib qaytadan urinib ko'ring.");
  }
}

// ---- Long-polling loop -----------------------------------------------------

async function main() {
  if (!TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set.");
    process.exit(1);
  }
  if (!hasDatabase()) {
    console.error("❌ DATABASE_URL is a placeholder. Configure Neon first, then re-run.");
    process.exit(1);
  }
  if (ADMIN_IDS.length === 0) {
    console.warn(
      "⚠️  TELEGRAM_ADMIN_CHAT_ID is empty. Message the bot; it replies with your chat id. " +
        "Add it to TELEGRAM_ADMIN_CHAT_ID and restart to enable managing products.",
    );
  }

  const me = await tg<{ username: string }>("getMe", {});
  await tg("setMyCommands", { commands: COMMANDS }).catch(() => {});
  console.log(`🤖 Admin bot running as @${me.username}. Press Ctrl+C to stop.`);

  let offset = 0;
  const backlog = await tg<Update[]>("getUpdates", { timeout: 0, offset: -1 });
  if (backlog.length > 0) offset = backlog[backlog.length - 1].update_id + 1;

  // Short-poll (timeout: 0) with a small delay, instead of a 30s long-poll.
  // Some networks (e.g. ISPs in Uzbekistan) tear down sustained connections to
  // Telegram, so a long-poll request is reset mid-flight ("fetch failed"). Quick
  // requests complete before that happens, so we poll briefly every POLL_DELAY ms.
  const POLL_DELAY = 2000;
  for (;;) {
    try {
      const updates = await tg<Update[]>("getUpdates", { timeout: 0, offset });
      for (const u of updates) {
        offset = u.update_id + 1;
        await handleUpdate(u);
      }
    } catch (error) {
      console.error("polling error:", (error as Error).message);
    }
    await new Promise((r) => setTimeout(r, POLL_DELAY));
  }
}

main().catch(async (error) => {
  console.error("Fatal:", error);
  await prisma.$disconnect();
  process.exit(1);
});
