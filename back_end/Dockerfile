FROM node:16 as base

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src

COPY package.json ./

# RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3
ENV PATH /usr/src/node_modules/.bin:$PATH
RUN npm install --no-optional && npm cache clean --force

# In the app directory
WORKDIR /usr/src/app

EXPOSE 3000
