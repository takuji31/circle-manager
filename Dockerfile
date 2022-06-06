# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl default-mysql-client

# Install all node_modules, including dev dependencies
FROM base as deps

ENV NODE_ENV development

WORKDIR /myapp

ADD package.json yarn.lock ./
RUN yarn install --ignore-scripts


# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json yarn.lock ./
RUN yarn install --production --ignore-scripts --prefer-offline

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
ADD package.json ./
RUN yarn generate:db

ADD . .
RUN yarn build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT 8080
ENV NODE_ENV production

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public
ADD . .

CMD ["yarn", "start"]
