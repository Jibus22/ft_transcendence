FROM node:17

WORKDIR /usr/src/app
COPY ./package.json .
RUN yarn
ENV PATH /usr/src/app/node_modules/.bin:$PATH

LABEL service=frontend
EXPOSE 3000
