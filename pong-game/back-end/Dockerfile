From node:alpine as builder

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 3000
EXPOSE 5555

ENTRYPOINT ["sh", "./init-back.sh"]