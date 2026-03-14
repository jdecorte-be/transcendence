FROM oven/bun:1.1.8-alpine AS deps

WORKDIR /app

COPY ./code/package.json ./

RUN bun install --no-progress

FROM oven/bun:1.1.8-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY ./code ./

RUN bun run build

FROM oven/bun:1.1.8-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY ./code/package.json ./
RUN bun install --production --no-progress

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

USER bun

CMD ["bun", "run", "start:prod"]
