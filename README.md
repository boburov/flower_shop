# Bloomé — Gullar butigi

A premium **mobile-app-style** flower shop (Uzbek UI) with **Telegram-based ordering**. It renders
as a phone-width app — bottom tab bar (Bosh sahifa · Katalog · Savat · Profil), an address header,
a swipeable hero, and app-style product cards — centered over a backdrop on desktop. Browse
bouquets, quick-add to a basket, and place the order in a single pre-filled Telegram message — no
checkout, no account.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · Neon PostgreSQL**.

> **Runs with zero setup.** With the shipped placeholder env, the site uses bundled seed data
> and local placeholder images — just `npm install && npm run dev`. Wire up Neon and your VPS
> images when you're ready.

---

## Quick start

```bash
npm install          # also runs `prisma generate`
cp .env.example .env  # optional — defaults already work for local dev
npm run dev           # http://localhost:3000
```

That's it. The catalogue, filters, search, basket and Telegram ordering all work immediately
against in-repo seed data.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create & apply a migration (needs a real DB) |
| `npm run db:push` | Push schema without a migration |
| `npm run db:seed` | Seed categories + products |
| `npm run db:studio` | Open Prisma Studio |
| `npm run telegram:import -- ./dir` | Optional: upload photos to your Telegram bot |

---

## How ordering works (the core feature)

Orders are sent to **[@boburov_sh](https://t.me/boburov_sh)** (configurable in `lib/config.ts`).

- Every **"Order bouquet"** button builds a message with the product name, price (UZS),
  quantity, product ID, and any optional customer details, then opens
  `https://t.me/boburov_sh?text=<encoded message>` in a new tab.
- The **basket checkout** builds one message listing every item and the total.
- The message is **pre-filled, not sent** — the customer reviews and sends it themselves.
- A bare `https://t.me/boburov_sh` **fallback link** is always shown in case the pre-filled
  flow isn't supported.

Message building lives in `lib/telegram.ts`.

---

## Admin bot — add products from Telegram

`scripts/admin-bot.ts` is a standalone Telegram bot that lets authorized admins add
products to the catalogue through a guided chat (name → price → category → size →
description → photo). Products are written to the database, so the site shows them
immediately. Photos are stored as Telegram `file_id`s and served via `/api/images/<file_id>`.

```bash
# needs a real DATABASE_URL (see below), the bot token, and your admin chat id
npm run admin:bot
```

Setup:
1. Set `TELEGRAM_BOT_TOKEN` in `.env` (from @BotFather).
2. Run the bot and message it once — it replies with your **chat id**.
3. Put that id in `TELEGRAM_ADMIN_CHAT_ID` (comma-separated for several admins) and restart.
4. Message the bot `/add` to add a product; `/list`, `/cancel`, `/menu` also work.

Security: only chat ids in `TELEGRAM_ADMIN_CHAT_ID` can add products. The bot token is a
server-only secret — never commit it, never prefix it with `NEXT_PUBLIC_`. The bot is a
long-running process (run it on your VPS or locally), not a Vercel serverless function.

## Icons

UI icons are the **Iconly** set ([web.iconly.pro](https://web.iconly.pro)) via the
`react-iconly` package, wrapped in `components/ui/icons.tsx`. Iconly has no minus or flower
glyph, so those two are small original SVGs in the same file.

## Database (Neon PostgreSQL) — optional

The site works without a database. To use Neon:

1. Create a project at [neon.tech](https://neon.tech) and copy both connection strings.
2. In `.env`, set:
   - `DATABASE_URL` → the **pooled** connection string (ends with `-pooler...`).
   - `DIRECT_URL` → the **direct** connection string (used by Prisma Migrate).
3. Apply the schema and seed:
   ```bash
   npm run db:migrate   # or: npm run db:push
   npm run db:seed
   ```

`lib/products.ts` automatically reads from the database once a real `DATABASE_URL` is set, and
falls back to seed data on any error. All DB access is **server-side only** — the browser never
connects to PostgreSQL. Schema: `prisma/schema.prisma` (Category 1-to-many Product, indexed on
slug/category/featured).

---

## Images

Flower photography is served as **plain static files**. In development they're local
placeholders under `public/images/flowers`. For production, host real photos on your VPS and
point the app at them with two env vars. Full workflow — including the optional Telegram image
pipeline — is in **[docs/IMAGES.md](docs/IMAGES.md)**.

---

## Deployment (Vercel)

1. Push to a Git repo and import it in Vercel.
2. Add env vars from `.env.example` (Neon `DATABASE_URL`/`DIRECT_URL`,
   `NEXT_PUBLIC_TELEGRAM_USERNAME`, and image vars if using a VPS).
3. Deploy. Run `npm run db:migrate && npm run db:seed` once against your Neon database.

`NEXT_PUBLIC_*` vars are safe for the browser. **Never** put the Telegram bot token in a
`NEXT_PUBLIC_` variable — it's server-only.

---

## Project structure

```
app/
  layout.tsx                App shell (phone-width column) + bottom tab nav
  page.tsx                  Home (address header, hero carousel, Mashhur/Buketlar tabs)
  shop/page.tsx             Katalog with live search / filter / sort
  product/[slug]/page.tsx   Product detail (SSG + per-product OG metadata)
  basket/page.tsx           Savat + Telegram checkout
  profile/page.tsx          Profil (shop info + contact)
  api/products/route.ts     Server-side catalogue endpoint
  api/images/[fileId]/route.ts  Optional Telegram image proxy
components/  app (home/app cards) · layout (bottom-nav) · products · basket · ui
lib/         config · prisma · products · telegram · catalogue · types · data/seed-data
prisma/      schema.prisma · seed.ts
scripts/     telegram-image-import.ts · generate-placeholders.mjs
```

---

## Configuration

Everything business-specific lives in **`lib/config.ts`**: shop name, Telegram username, price
formatting, image base URL, and contact placeholders. Replace the placeholder Instagram/email/
hours before launch — no real contact details are invented in the code.
