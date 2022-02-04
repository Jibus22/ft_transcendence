FROM node:17

WORKDIR /usr/src/app
COPY ./package.json .
ENV PATH /usr/src/app/node_modules/.bin:$PATH
RUN yarn


RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/
WORKDIR /usr/src/app
LABEL service=frontend
EXPOSE 3000
