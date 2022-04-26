# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

RUN npm install -g pnpm@7.0.0-rc8

FROM base

ENV NODE_ENV development

WORKDIR /myapp

ADD . .
RUN pnpm install

FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp /myapp

ADD prisma .
RUN npx prisma generate

ADD . .
RUN pnpm build:web

CMD ["pnpm", "-F", "web", "start"]
