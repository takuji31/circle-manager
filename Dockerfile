# base node image
FROM node:16.15.1-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN --mount=target=/var/lib/apt/lists,type=cache \
    --mount=target=/var/cache/apt,type=cache \
    apt-get update && apt-get install -y openssl default-mysql-client ca-certificates

# Install all node_modules, including dev dependencies
FROM base as deps

ENV NODE_ENV development

WORKDIR /myapp

ADD package.json yarn.lock .yarnrc.yml ./
ADD .yarn/ .yarn/
RUN --mount=target=/myapp/.yarn/cache,type=cache \
    --mount=target=/myapp/.yarn/unplugged,type=cache \
    yarn install --mode=skip-build


# Setup production node_modules
FROM deps as production-deps

WORKDIR /myapp

ENV NODE_ENV production

ADD package.json yarn.lock .yarnrc.yml ./
ADD .yarn/ .yarn/
RUN --mount=target=/myapp/.yarn/cache,type=cache \
    --mount=target=/myapp/.yarn/unplugged,type=cache \
    yarn workspaces focus --all --production

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
ADD package.json ./
ADD .yarn/ .yarn/
RUN yarn generate:db

ADD . .
RUN yarn build

FROM base as production

ENV TZ "Asia/Tokyo"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

FROM production as bot

ADD . .

CMD ["yarn", "start:bot"]


FROM production as web

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
ADD . .

CMD ["yarn", "start"]
