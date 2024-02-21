# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app1

# Copy package.json and package-lock.json to the container
COPY package.json ./

COPY app.js ./

RUN npm install

# Expose a port for the Node.js application
EXPOSE 8080

# Start the Node.js application
CMD [ "node", "app.js" ]