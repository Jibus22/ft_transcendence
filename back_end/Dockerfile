FROM node:17 as base

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src

COPY package.json ./

# RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3
ENV PATH /usr/src/node_modules/.bin:$PATH
# RUN npm install --no-optional && npm cache clean --force
RUN yarn && yarn cache clean

# In the app directory
WORKDIR /usr/src/app
RUN apt-get update && apt-get upgrade && apt-get -yq install inotify-tools

EXPOSE 3000
