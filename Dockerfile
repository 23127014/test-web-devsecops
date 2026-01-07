FROM oven/bun:latest as base
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

EXPOSE 3000
ENTRYPOINT [ "bun", "run", "serve" ]
