FROM oven/bun:1.3.14-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./

# 先安装依赖，但不执行 postinstall，避免 nuxt prepare 提前失败
RUN bun install --frozen-lockfile --no-progress --ignore-scripts

COPY . .

# 源码复制完成后再构建，Nuxt 会正常 prepare/build
RUN bun run build


FROM oven/bun:1.3.14-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=5802

COPY package.json bun.lock ./

# runtime 阶段不要执行 postinstall，否则又会触发 nuxt prepare
RUN bun install --production --frozen-lockfile --no-progress --ignore-scripts

COPY --from=build /app/.output ./.output

EXPOSE 5802

CMD ["bun", ".output/server/index.mjs"]