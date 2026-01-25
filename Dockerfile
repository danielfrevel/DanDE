# Build stage
FROM hugomods/hugo:exts AS builder

WORKDIR /src

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-audit

# Copy source files
COPY . .

# Build the site
RUN hugo --minify

# Generate search index
RUN npx pagefind --site public

# Runtime stage
FROM nginx:alpine

# Copy built site
COPY --from=builder /src/public /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
