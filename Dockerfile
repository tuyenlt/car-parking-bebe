# Chọn Node phiên bản mới nhất
FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'development' ]; then npm run start:dev; else npm run start; fi"]
