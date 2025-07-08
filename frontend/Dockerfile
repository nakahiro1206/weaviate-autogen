# Use Node.js Alpine for a small image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies inside Docker
RUN npm ci

# Copy the entire project
COPY . .

# Build the frontend (Next.js/Vite/React/etc.)
RUN npm run build

# Start the app
CMD ["npm", "start"]
