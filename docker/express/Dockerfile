FROM node:18-alpine as ts-compiler
WORKDIR /usr/app
COPY . ./
ENV BASE_URL=http://host.docker.internal:3000
RUN npm install
RUN npm run compile
CMD node dist/src/app.js
