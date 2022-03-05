FROM node:16.13.1-alpine3.12

ARG GOOGLE_KEY_VALUE

RUN adduser -HD -s /bin/sh 1000
RUN apk add openssl curl

WORKDIR /app/dist
RUN chown 1000 /app -R

USER 1000

COPY yarn.lock package.json ./

RUN yarn install -s --prod --no-progress
COPY ./dist/ .

ENV GOOGLE_KEY=$GOOGLE_KEY_VALUE

EXPOSE 5009

CMD ["node", "src/main.js"]
