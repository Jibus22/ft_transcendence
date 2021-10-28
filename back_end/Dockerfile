FROM node:14

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src
COPY package*.json package*.json* ./
RUN npm install --no-optional && npm cache clean --force
ENV PATH /usr/src/node_modules/.bin:$PATH

# In the app directory
WORKDIR /usr/src/app

# COPY . .

# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 3000
# CMD [ "node", "server.js" ]
CMD [ "npm", "run", "start:dev" ]
# ENTRYPOINT ["tail", "-f", "/dev/null"]
