FROM node:18-alpine

WORKDIR /app

RUN npm install -g yarn@4.1.1

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn run prepare

COPY . .

ENV PORT=3000

CMD ["yarn", "start"]

EXPOSE 3000
