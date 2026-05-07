# ============================================================
# Stage 1 — Build React app
# ============================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --silent

# Copy the rest of the source code
COPY . .

# Build for production
RUN npm run build

# ============================================================
# Stage 2 — Serve with Nginx (tiny, production-ready image)
# ============================================================
FROM nginx:1.25-alpine AS production

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React files from Stage 1
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
