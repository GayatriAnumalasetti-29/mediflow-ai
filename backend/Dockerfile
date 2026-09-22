# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo root manifests for workspace resolution
COPY package.json package-lock.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install workspace deps + generate Prisma client
RUN npm install --workspaces
RUN npm --workspace=backend run prisma:generate

# Compile TypeScript
RUN npm run build:shared && npm run build:backend

# ---- Stage 2: Runtime ----
FROM node:20-alpine

WORKDIR /app

# Copy compiled output & node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/prisma ./backend/prisma

# Copy Tesseract training data for OCR
COPY backend/eng.traineddata ./backend/eng.traineddata

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "dist/server.js"]
