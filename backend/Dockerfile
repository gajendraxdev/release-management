FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
