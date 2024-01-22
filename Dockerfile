FROM node:lts-alpine
LABEL authors="ozeliurs"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 8000

# Run app
CMD [ "npm", "start" ]