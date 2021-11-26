# syntax=docker/dockerfile:1

FROM node:16.13-alpine3.12

WORKDIR /client

COPY package.json .

# Since project is bootsrapped with CRA, it expects specific file structure
# Where /src and /public must be present
COPY ./src ./src
COPY ./public ./public

RUN yarn install && yarn build

CMD ["yarn", "start"]