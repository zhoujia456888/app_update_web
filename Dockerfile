FROM node:24.15.0-bookworm-slim AS build

WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build


FROM node:24.15.0-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=5802

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund --ignore-scripts

COPY --from=build /app/.output ./.output

EXPOSE 5802
CMD ["node", ".output/server/index.mjs"]
