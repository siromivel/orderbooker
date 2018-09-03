#!/bin/bash

sudo yum update -y && \
sudo yum install -y docker && \
sudo yum install -y git && \
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash - && \
sudo yum -y install nodejs && \
sudo npm install -g typescript tsc pm2 && \
sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose && \
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
sudo service docker start && \
cd orderbooker && npm install && tsc --project tsconfig.json && npm run bundle-dev && \
sudo docker-compose up --build -d
