FROM node:18-alpine

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn run prepare

COPY . .

ENV PORT=3000
CMD ["yarn", "start"]

EXPOSE 3000
