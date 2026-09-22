# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo root manifests for workspace resolution
COPY package.json package-lock.json ./
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Install all workspace dependencies
RUN npm install --workspaces

# Build shared package first, then frontend
RUN npm run build:shared && npm run build:frontend

# ---- Stage 2: Serve with Nginx ----
FROM nginx:1.25-alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# SPA fallback — send all routes to index.html
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
