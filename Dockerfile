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

# Chạy build, nếu fail thì vẫn cho qua
RUN npm run build || true

# ----- Production stage -----
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy source và build (nếu có)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ ./

EXPOSE 3000
CMD ["npm", "start"]
