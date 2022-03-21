# Common build stage
FROM node:lts-alpine@sha256:2c6c59cf4d34d4f937ddfcf33bab9d8bbad8658d1b9de7b97622566a52167f2b as common-build-stage

ARG HOME=/home/node

WORKDIR ${HOME}/app

EXPOSE 3000

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

COPY . ${HOME}/app

RUN npm install

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

RUN apk add dumb-init

ENV NODE_ENV production

COPY --chown=node:node . ${HOME}/app

RUN npm ci --only=production

USER node

CMD ["dumb-init", "npm", "start"]