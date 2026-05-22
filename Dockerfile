FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json ./
RUN bun install --no-progress

COPY . .
RUN bun run build


FROM oven/bun:1 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=5802

COPY package.json ./
RUN bun install --production --no-progress

COPY --from=build /app/.output ./.output

EXPOSE 5802
CMD ["bun", ".output/server/index.mjs"]
