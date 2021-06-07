FROM node:14.15-slim

# Set working directory to mount contents
WORKDIR /usr/app

# Copy all packages within working directory
COPY ./packages ./packages

# Copy proxy-service to the container
COPY ./microservices/proxy-service ./microservices/proxy-service

# Copy root-level dependencies required to build and run the container
COPY ./package.json .
COPY ./lerna.json .
COPY tsconfig.json .
COPY jest.config.js .
COPY jest.config.base.js .

# Copy environment variables
COPY .env.example .env

# Install root-level package dependencies i.e. Lerna
RUN npm install

# Install package dependencies across packages and service
RUN npm run bootstrap

# Build packages and service
RUN npm run build

# Expose port for service communication
EXPOSE 8015

# Start the servide from the container
CMD ["npm", "start"]
