# Build on the native platform of the build machine, the build output is
# platform independent, so no emulation is needed for the slow build steps
FROM --platform=$BUILDPLATFORM node:22.23.2-alpine3.24 AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @leihbase/web run build 

FROM node:22.23.2-alpine3.24 AS prod

ENV NUXT_PORT=3000
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NUXT_HOST=0.0.0.0

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/web/.output /app/.output
CMD node .output/server/index.mjs
