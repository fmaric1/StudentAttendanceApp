FROM node:latest

WORKDIR ./wt22p18556/public

COPY ./public/scripts/package*.json ./
RUN npm install

COPY . ..


WORKDIR ./../
EXPOSE 8080
CMD [ "node", "index.js" ]