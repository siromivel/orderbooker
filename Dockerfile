FROM node:10.9.0
MAINTAINER Levi Morris
ADD . ./

ENTRYPOINT ["node", "server/server.js"]