# Use an official Node.js runtime as the base image
FROM --platform=linux/amd64 node:16 as build

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Use an official Node.js runtime as the base image
FROM --platform=linux/amd64 node:16-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy only the necessary files from the previous stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

# Define the command to run the app
CMD [ "node", "index.js" ]