# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine

# Important: use development mode so devDependencies like typescript get installed
ENV NODE_ENV development

WORKDIR /usr/src/app

# Install dependencies (including devDependencies like typescript)
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# Run the application as a non-root user (optional for Expo dev)
# USER node

# Copy app source after installing deps
COPY . .

# Expose the Metro port
EXPOSE 8081

# Start the app
CMD npx expo start
