# backend/Dockerfile — Node 20 (production)
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files first for caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy rest of the app
COPY . .

# Optional: run migrations at build-time (safe fallback)
# If migrate requires DB to be reachable at build-time, you can remove this line.
# RUN node migrations/create_tables.js || true

EXPOSE 4000
ENV PORT=4000

CMD ["node", "index.js"]
