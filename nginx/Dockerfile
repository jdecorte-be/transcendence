FROM oven/bun:1.1.8-alpine AS build

WORKDIR /app

COPY ./frontend/code/package.json ./

RUN bun install --no-progress

COPY ./frontend/code ./

RUN bun run build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /var/www/html