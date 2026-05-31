FROM node:20-alpine

# Prisma가 Alpine에서 동작하려면 openssl, libc6-compat 필요
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
