# Use a small, official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only package files first (this lets Docker cache the npm install layer
# so rebuilds are fast when you only change source code, not dependencies)
COPY package*.json ./

RUN npm install --production

# Now copy the rest of the application source
COPY . .

# The app listens on this port (matches PORT in .env / index.js default)
EXPOSE 3000

# Basic container-level health check — Docker will mark the container
# "unhealthy" if this fails repeatedly, which matters later for
# self-healing/rollback logic
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]