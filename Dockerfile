# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build the application
RUN npm run build

# Runtime stage
FROM node:20-slim

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
# We need the shared folder for schemas if esbuild didn't bundle them (it usually doesn't if marked external)
# But wait, buildAll bundles the server into dist/index.cjs. 
# External deps are kept in node_modules.

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
# We run db:push to ensure the database schema is up to date before starting
CMD ["sh", "-c", "npx drizzle-kit push && node dist/index.cjs"]
