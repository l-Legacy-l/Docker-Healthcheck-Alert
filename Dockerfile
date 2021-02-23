FROM node:15.9.0-alpine3.10
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci --only=production
RUN npm run build

CMD ["npm", "start"]