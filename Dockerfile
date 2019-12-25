FROM node:alpine
RUN mkdir -p /apigeoloc
COPY . /apigeoloc
WORKDIR /apigeoloc
RUN npm i
RUN chown -R node:node /apigeoloc
USER node
EXPOSE 8000
CMD ["npm", "start"]