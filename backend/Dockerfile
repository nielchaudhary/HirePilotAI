FROM node:18

WORKDIR /app

RUN npm install -g pnpm typescript

COPY package*.json pnpm-lock.yaml* ./

COPY . .


RUN npx prisma generate --schema=./src/prisma/schema.prisma

RUN pnpm install --ignore-scripts


RUN pnpm run build

EXPOSE 8090

CMD ["pnpm", "run", "dev"]