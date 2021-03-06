FROM node:16.13.1-alpine3.12

RUN adduser -HD -s /bin/sh 1000
RUN apk add openssl curl

WORKDIR /app/dist
RUN chown 1000 /app -R

USER 1000

COPY yarn.lock package.json ./

RUN yarn install -s --prod --no-progress
COPY ./dist/ .
COPY ./google-services.json .

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/dist/google-services.json

EXPOSE 5009

CMD ["node", "main.js"]
