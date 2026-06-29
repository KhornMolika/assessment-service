FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]