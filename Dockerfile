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
COPY --chown=nonroot:nonroot --chmod=600 package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Bundle app source
COPY --chown=nonroot:nonroot --chmod=600 front ./front
COPY --chown=nonroot:nonroot --chmod=600 back ./back

# Expose port
EXPOSE 8000

# Run app
CMD [ "npm", "start" ]