FROM node:10.13-alpine

COPY ["package.json","package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 8000

CMD npm start