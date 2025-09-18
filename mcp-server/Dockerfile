FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

ENV MCP_PORT=4000
EXPOSE 4000

CMD ["node", "server.js"]
