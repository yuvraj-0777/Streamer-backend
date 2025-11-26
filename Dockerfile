FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000

# ENTRYPOINT [ "node", "src/index.js" ]

CMD [ "npm", "run", "dev" ]