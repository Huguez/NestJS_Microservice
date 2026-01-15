FROM node:20-bookworm

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3001