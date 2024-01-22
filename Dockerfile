FROM node:lts-alpine
LABEL authors="ozeliurs"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --ignore-scripts

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

RUN chown -R nonroot:nonroot /usr/src/app

USER nonroot

# Bundle app source
COPY front ./front
COPY back ./back

# Expose port
EXPOSE 8000

# Run app
CMD [ "npm", "start" ]