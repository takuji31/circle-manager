# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl chromium

RUN npm install -g pnpm@7.0.0-rc.8

FROM base as deps

ENV NODE_ENV development

WORKDIR /myapp

ADD . .
RUN pnpm install

FROM base

WORKDIR /myapp

COPY --from=deps /myapp /myapp

RUN pnpm -F web db:generate

RUN pnpm build:web

CMD ["pnpm", "-F", "web", "start"]
