# ============================================================
# Build
# ============================================================
FROM oven/bun:1.4.0-alpine AS build

WORKDIR /app

# Bun 镜像源配置放在 bunfig.toml
COPY package.json bun.lock bunfig.toml ./

# 安装完整依赖
RUN bun install --frozen-lockfile --no-progress

# 复制项目源码
COPY . .

# Nuxt 生产构建
RUN bun run build


# ============================================================
# Runtime
# ============================================================
FROM oven/bun:1.4.0-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=5802

# 只复制 Nitro 生产产物
COPY --from=build /app/.output ./.output

EXPOSE 5802

CMD ["bun", ".output/server/index.mjs"]