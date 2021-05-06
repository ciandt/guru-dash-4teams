FROM node:14.15.1-buster-slim

ENV APP_HOME /opt/app
RUN mkdir -p $APP_HOME

WORKDIR $APP_HOME

COPY ./ /opt/app

RUN npm install
RUN npm run build

CMD [ "npm", "start" ]
