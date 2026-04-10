FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
EXPOSE 8001
CMD ["node", "server.js"]
