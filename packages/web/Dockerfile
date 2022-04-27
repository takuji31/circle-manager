# syntax = docker/dockerfile:1.2

# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production
ENV TZ Asia/Tokyo
ENV BASE_URL https://shin-umamusume.takuji31.dev
ENV NEXTAUTH_URL https://shin-umamusume.takuji31.dev

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl chromium

RUN npm install -g pnpm@7.0.0-rc.8

FROM base as deps

ENV NODE_ENV development

WORKDIR /myapp

ADD . .

RUN --mount=type=secret,id=_env,dst=/etc/secrets/.env cp /etc/secrets/.env /myapp/.env
RUN pnpm install

FROM base

WORKDIR /myapp

COPY --from=deps /myapp /myapp

RUN pnpm build:web

CMD ["pnpm", "-F", "web", "start"]
