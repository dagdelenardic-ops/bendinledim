FROM node:20-bookworm-slim

# Install build tools for native modules (better-sqlite3)
RUN apt-get update -y && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# Next.js standalone server changes CWD to `.next/standalone`.
# Use an absolute sqlite path so Prisma migrations and runtime read the same DB file.
ENV DATABASE_URL=file:/app/dev.db

COPY . .

# Install ALL deps including devDependencies (needed for build)
RUN npm ci

# Seed the sqlite DB into the image (optional).
# If prisma/seed.db exists, use it as the initial content; otherwise create an empty DB file.
RUN if [ -f prisma/seed.db ]; then cp prisma/seed.db /app/dev.db; else touch /app/dev.db; fi && \
    npx prisma generate && npx prisma migrate deploy && npm run build

# Next.js standalone requires static assets to be copied manually
RUN cp -r .next/static .next/standalone/.next/static && \
    cp -r public .next/standalone/public

# Set production after build
ENV NODE_ENV=production

EXPOSE 8080

CMD ["sh", "-c", "test -f /app/dev.db || touch /app/dev.db; npx prisma migrate deploy && node .next/standalone/server.js"]
