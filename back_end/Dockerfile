FROM node:17 as base

# Up one directory regarding the app, we set the node_modules
WORKDIR /usr/src/app
COPY ./package.json .
ENV PATH /usr/src/app/node_modules/.bin:$PATH
# RUN yarn && yarn cache clean
RUN yarn
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg ; apt update ;apt install -y postgresql-13

RUN apt install exa
RUN echo "alias l='exa -lia'" >> /root/.bashrc
LABEL service=backend
EXPOSE 3000

