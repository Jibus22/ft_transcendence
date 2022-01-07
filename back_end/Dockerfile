FROM node:17 as base

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src/app

COPY package.json ./

# RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3
ENV PATH /usr/src/node_modules/.bin:$PATH
# RUN npm install --no-optional && npm cache clean --force
RUN yarn && yarn cache clean
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg ; apt update ;apt install -y postgresql-13


# COPY ormconfig.js ./
# In the app directory
# WORKDIR /usr/src/app

EXPOSE 3000

