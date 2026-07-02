FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]
