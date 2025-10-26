FROM node:18-alpine

WORKDIR /app

# Cài dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Mở cổng frontend
EXPOSE 3000

# Bypass lỗi OpenSSL (Node 18 cần nếu bạn dùng legacy provider)
ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "start"]
