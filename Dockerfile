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

# Generate Prisma client and build Next.js
RUN npx prisma generate && npm run build

# Set production after build
ENV NODE_ENV=production

EXPOSE 8080

CMD ["sh", "-c", "test -f /app/dev.db || touch /app/dev.db; npx prisma migrate deploy && node .next/standalone/server.js"]
