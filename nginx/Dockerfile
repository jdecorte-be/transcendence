FROM node:18-alpine AS build

WORKDIR /app

ARG REACT_APP_API_ENDPOINT
ARG REACT_APP_SOCKET_ENDPOINT
ARG REACT_APP_AUTH_PATH
ARG REACT_APP_GITHUB_AUTH_PATH
ARG REACT_APP_LOGOUT

ENV REACT_APP_API_ENDPOINT=$REACT_APP_API_ENDPOINT
ENV REACT_APP_SOCKET_ENDPOINT=$REACT_APP_SOCKET_ENDPOINT
ENV REACT_APP_AUTH_PATH=$REACT_APP_AUTH_PATH
ENV REACT_APP_GITHUB_AUTH_PATH=$REACT_APP_GITHUB_AUTH_PATH
ENV REACT_APP_LOGOUT=$REACT_APP_LOGOUT

COPY ./frontend/code/package.json ./
COPY ./frontend/code/package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY ./frontend/code ./

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.25-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /var/www/html