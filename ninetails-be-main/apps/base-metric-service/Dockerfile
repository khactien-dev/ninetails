FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY ../../package.json ./package.json

RUN npm install

FROM node:lts-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV production
COPY --chown=node:node --from=build /usr/src/app/ .
COPY ../../. .
RUN npm run build base-metric-service
EXPOSE 3000

CMD [ "node", "dist/apps/base-metric-service/main.js" ]