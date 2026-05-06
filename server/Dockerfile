FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY dist/ ./dist/
COPY .env.example ./.env

EXPOSE 3000

CMD ["node", "dist/index.js"]
