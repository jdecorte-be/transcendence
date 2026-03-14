FROM node:18-alpine AS deps

WORKDIR /app

COPY ./code/package*.json ./

RUN npm ci

FROM node:18-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY ./code ./

RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY ./code/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

USER node

CMD ["node", "dist/main.js"]
