FROM node:18-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libstdc++ python3 make g++

COPY ./code/package.json ./

RUN npm install --no-audit --no-fund

FROM node:18-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY ./code ./

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libstdc++ python3 make g++

COPY ./code/package.json ./
COPY --from=build /app/prisma ./prisma

RUN npm install --omit=dev --no-audit --no-fund
RUN npx prisma generate

COPY --from=build /app/dist ./dist

CMD ["node", "dist/main"]
