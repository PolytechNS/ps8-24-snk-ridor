FROM node:lts-alpine
LABEL authors="ozeliurs"

# Create app directory
WORKDIR /usr/src/app

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

RUN chown -R nonroot:nonroot /usr/src/app \
    && chmod -R 755 /usr/src/app

USER nonroot

# Install app dependencies
COPY --chown=nonroot:nonroot package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY --chown=nonroot:nonroot front ./front
COPY --chown=nonroot:nonroot back ./back

# Expose port
EXPOSE 8000

# Run app
CMD [ "npm", "start" ]