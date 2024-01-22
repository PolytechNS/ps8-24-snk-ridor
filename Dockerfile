FROM node:lts-alpine
LABEL authors="ozeliurs"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

FROM node:lts-alpine
LABEL authors="ozeliurs"

# Create app directory
WORKDIR /usr/src/app

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

USER nonroot

# Copy app dependencies
COPY --from=0 --chown=nonroot:nonroot /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=nonroot:nonroot --chmod=400 front ./front
COPY --chown=nonroot:nonroot --chmod=400 back ./back

# Expose port
EXPOSE 8000

# Run app
CMD [ "npm", "start" ]