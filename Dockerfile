FROM node:10.9.0

ADD . ./
RUN npm install -g pm2

CMD ["pm2-runtime", "server/server.js"]