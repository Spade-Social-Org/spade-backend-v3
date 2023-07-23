FROM node:16.14

WORKDIR /usr/src/app

COPY package*.json ./

COPY tsconfig.build.json ./

COPY tsconfig.json ./

RUN yarn global add nest typeorm

RUN yarn install

USER root

COPY --chown=node:node . .

RUN yarn build

EXPOSE 5011

CMD [ "yarn", "start" ]
