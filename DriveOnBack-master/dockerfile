FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  chromium \
  wget \
  gnupg \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 4000

CMD ["npm", "run", "dev"]
