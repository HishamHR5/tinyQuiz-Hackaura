# TinyQuiz-Backend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
# Cloud Run injects PORT; your server uses process.env.PORT (good)
# EXPOSE is optional; Cloud Run ignores it but keeps documentation tidy
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]