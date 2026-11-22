FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 26 -g
WORKDIR /app

FROM base AS build

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run --filter "*" build

FROM base

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml .
RUN pnpm fetch --prod
RUN pnpm install --offline --frozen-lockfile --prod

COPY --from=build /app/client/dist /app/client/dist
COPY --from=build /app/server /app/server

WORKDIR /app/server

ENV AUTH_SECRET=
ENV PORT=80

EXPOSE 80
CMD [ "pnpm", "run", "start" ]
