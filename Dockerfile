# Build stage
FROM node:20-alpine AS builder
ENV HTTP_PROXY=http://192.168.231.99:3128
ENV HTTPS_PROXY=http://192.168.231.99:3128
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN npm config set proxy http://192.168.231.99:3128 && \
    npm config set https-proxy http://192.168.231.99:3128 && \
    npm config set registry https://registry.npmjs.org

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies without package-lock.json to avoid musl issues
RUN npm install --force

# Copy source code
COPY . .

# Fix npm optional dependencies bug for Alpine Linux (musl)
# Remove node_modules and package-lock.json, then reinstall to get correct binaries
RUN rm -rf node_modules package-lock.json && \
    npm install --force

# Build the application
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8090

CMD ["nginx", "-g", "daemon off;"] 