# Telegram proxy (Cloudflare Worker)

VPS (O'zbekiston) `api.telegram.org`ga chiqa olmaydi. Bu Worker Cloudflare
chekkasida ishlaydi va so'rovlarni Telegram'ga uzatadi, shunda bot VPS'da
24/7 ishlay oladi va sayt Telegram rasmlarini ko'rsata oladi.

```
VPS bot / web  ->  flower-tg-proxy.<subdomain>.workers.dev  ->  api.telegram.org
```

## A variant — Dashboard orqali (CLI shart emas, eng oson)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Nom: `flower-tg-proxy` → **Deploy**.
3. **Edit code** → `worker.js` ichidagi kodni to'liq ko'chirib qo'ying → **Deploy**.
4. Worker **Settings → Variables → Add variable**: `ALLOWED_BOT_ID` = `8627832860` → Save/Deploy.
5. URL'ni nusxa oling: `https://flower-tg-proxy.<subdomain>.workers.dev`.

## B variant — Wrangler (CLI) orqali

```bash
cd cloudflare
npx wrangler login       # brauzerda ochiladi
npx wrangler deploy      # URL'ni chiqaradi
```

## Deploydan keyin — VPS'ni ulash

VPS `.env` (ham web, ham bot uchun) ga qo'shing:

```
TELEGRAM_API_BASE=https://flower-tg-proxy.<subdomain>.workers.dev
```

Keyin VPS'da:

```bash
cd /var/www/flower_shop   # loyiha yo'li
npm run build             # web app build-time env'ni oladi
pm2 restart rosella-web
pm2 start "npm run admin:bot" --name rosella-bot
pm2 save
```

Bot endi VPS'da doimiy ishlaydi. Mac shart emas.

> `TELEGRAM_API_BASE` bo'sh bo'lsa, kod odatdagidek to'g'ridan-to'g'ri
> `api.telegram.org`ga chiqadi — lokal ishlashga ta'sir qilmaydi.
