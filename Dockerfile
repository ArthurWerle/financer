FROM node:20

WORKDIR /

COPY . .

RUN pnpm install

RUN pnpm run build

ENV NODE_ENV production

EXPOSE 3000

CMD [ "pnpm", "run", "start" ]