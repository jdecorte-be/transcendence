FROM oven/bun:1.1.8-alpine AS build

WORKDIR /app

COPY ./code/package.json ./

RUN bun install --no-progress

COPY ./code ./

RUN bun run build

FROM alpine:3.19

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/build ./build

USER app

CMD ["sh", "-c", "sleep infinity"]
