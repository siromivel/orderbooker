FROM node:10.9.0
MAINTAINER Levi Morris

ADD . ./
RUN npm install -g pm2

CMD ["pm2-runtime", "server/server.js"]