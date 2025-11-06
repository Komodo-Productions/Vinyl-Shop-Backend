# Use Node LTS
FROM node:18

# Set workdir
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port Express runs on
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev"]   # or ["node", "server.js"] if no nodemon
