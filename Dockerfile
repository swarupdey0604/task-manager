FROM node:18-slim
WORKDIR /app 
COPY package*.json ./ 
RUN npm install --production 
COPY app.js . 
COPY .env . 
EXPOSE 3000 
CMD ["node", "app.js"]
