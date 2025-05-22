FROM oven/bun:latest

RUN mkdir -p /neptune
WORKDIR /neptune
COPY . /neptune

RUN bun install
RUN bun run build

EXPOSE 8080

CMD ["bun", "run", "serve"]