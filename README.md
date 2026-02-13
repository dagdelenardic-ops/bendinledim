# Ben Dinledim

Next.js tabanli muzik haber platformu.

## Lokal Calistirma

```bash
npm ci
touch dev.db
# Prisma 7 + sqlite: db dosyasi yoksa migrate deploy baglanamaz
DATABASE_URL=file:./dev.db npx prisma migrate deploy
npx prisma generate
npm run dev
```

Varsayilan port: `3001`.

## Zorunlu Ortam Degiskenleri

`.env` icinde en az su degiskenleri tanimlayin:

```bash
# Lokal: repo kokunde dev.db
DATABASE_URL=file:./dev.db

# Docker / Cloud Run: Next.js standalone server CWD degistirdigi icin sqlite yolu absolute olmali
# (isterseniz Dockerfile zaten varsayilan olarak bunu set ediyor)
# DATABASE_URL=file:/app/dev.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=guclu-bir-sifre
GEMINI_API_KEY=...
OPENAI_API_KEY=...
```

## Guvenlik

- Uretim ortaminda `/admin` varsayilan olarak kapali (404). Acmak icin `ENABLE_ADMIN_DASHBOARD=true` verin.
- Icerik yonetimi icin yerelde `admin.local.html` kullanilir (deploy edilmez).
- Admin API endpointleri Basic Auth ile korunur.
- `ADMIN_USERNAME` ve `ADMIN_PASSWORD` yoksa korumali endpointler `503` doner.

## Docker

```bash
docker build -t bendinledim .
docker run -p 8080:8080 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=guclu-bir-sifre \
  -e OPENAI_API_KEY=... \
  -e GEMINI_API_KEY=... \
  bendinledim
```

## GitHub -> Google Cloud Run Deploy

Workflow dosyasi: `.github/workflows/deploy-google.yml`

Main branch'e push oldugunda otomatik deploy eder. `src/app/admin/**` degisiklikleri deploy tetiklemez.

Gerekli GitHub Secrets:

- `GCP_SA_KEY`
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_CLOUD_RUN_SERVICE`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

## Local Admin (admin.local.html)

Dosya: `admin.local.html` (git ve docker ignore).

Bu arayuz:
- `POST /api/chatgpt` ile ChatGPT uretimi yapar (anahtar sunucuda `OPENAI_API_KEY` olarak durur).
- `POST /api/articles` ve `PUT /api/articles/:slug` ile canliya kaydeder.
