FROM node:20-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
# Next.js standalone server changes CWD to `.next/standalone`.
# Use an absolute sqlite path so Prisma migrations and runtime read the same DB file.
ENV DATABASE_URL=file:/app/dev.db

COPY package*.json ./
# Skip postinstall (prisma generate) during npm ci because schema isn't copied yet
RUN npm ci --ignore-scripts

COPY . .

# Now generate Prisma client and build
RUN npx prisma generate && npm run build

EXPOSE 8080

CMD ["sh", "-c", "test -f /app/dev.db || touch /app/dev.db; npx prisma migrate deploy && node .next/standalone/server.js"]
