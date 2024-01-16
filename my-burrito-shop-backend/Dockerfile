# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages including TypeScript
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Bundle app source
COPY . .

# Compile TypeScript files
RUN tsc

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variable for database host
ENV DB_HOST=mysql

# Run the application
CMD ["npm", "run dev"] # Assuming the compiled JS files are in dist/

