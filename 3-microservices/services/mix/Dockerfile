FROM mhart/alpine-node:latest

WORKDIR /srv
ADD . .
RUN npm install

EXPOSE 3000
CMD ["node", "server.js"]