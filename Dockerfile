# ----- Dependencies stage -----
ARG NODE_VERSION=20.19.1
FROM node:${NODE_VERSION}-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ----- Build stage -----
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Chạy build (nếu fail thì container không chạy được, nên KHÔNG dùng || true)
RUN npm run build

# ----- Production stage -----
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy output cần thiết cho runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3366

# Chạy Next.js ở production mode
CMD ["npm", "start"]
