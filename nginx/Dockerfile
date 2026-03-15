FROM node:18-alpine AS build

WORKDIR /app

COPY ./frontend/code/package.json ./
COPY ./frontend/code/package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY ./frontend/code ./

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /var/www/html