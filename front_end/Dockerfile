# FROM node:14

# # Create app directory
# WORKDIR /usr/src/app

# # Install app dependencies
# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# # where available (npm@5+)
# COPY package*.json ./

# RUN npm install
# # If you are building your code for production
# # RUN npm ci --only=production

# EXPOSE 3000
# # CMD [ "node", "server.js" ]
# CMD [ "npm", "run", "start" ]

FROM node:14

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src
COPY package*.json package*.json* ./
# RUN npm install --no-optional && npm -g install chokidar && npm cache clean --force
RUN yarn install

ENV PATH /usr/src/node_modules/.bin:$PATH

# In the app directory
WORKDIR /usr/src/app

EXPOSE 3000
CMD [ "npm", "run", "start" ]
