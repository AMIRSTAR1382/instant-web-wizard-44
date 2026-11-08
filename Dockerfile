# Explore: the site and its backend in one container. PocketBase serves the built site, the
# API (/api) and the admin dashboard (/_/). Its database lives in /pb/pb_data, which must be a
# disk that outlives the container (on Liara: liara.json "disks"). See DEPLOY.md.

# 1) Build the site.
FROM node:22-alpine AS site
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 2) PocketBase, from its official release, checked against the release's checksums.
FROM alpine:3.20
# Keep in step with VERSION in scripts/pocketbase.mjs.
ARG POCKETBASE_VERSION=0.40.6
ARG TARGETARCH
RUN apk add --no-cache ca-certificates wget unzip \
  && arch="${TARGETARCH:-amd64}" \
  && file="pocketbase_${POCKETBASE_VERSION}_linux_${arch}.zip" \
  && cd /tmp \
  && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/${file}" \
  && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/checksums.txt" \
  && grep " ${file}\$" checksums.txt | sha256sum -c - \
  && mkdir -p /pb \
  && unzip -q "${file}" pocketbase -d /pb \
  && rm -f /tmp/*.zip /tmp/checksums.txt

WORKDIR /pb
COPY --from=site /app/dist ./pb_public
COPY pocketbase/pb_migrations ./pb_migrations
COPY pocketbase/pb_hooks ./pb_hooks

EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--publicDir=/pb/pb_public", "--migrationsDir=/pb/pb_migrations", "--hooksDir=/pb/pb_hooks"]
