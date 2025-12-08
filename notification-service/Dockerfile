FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the project INCLUDING prisma folder
COPY . .

# Now generate the correct Prisma client for Linux
RUN npx prisma generate

EXPOSE 8000

CMD ["node", "src/server.js"]
