# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV PORT=4200
COPY --from=build /app/dist/frontend ./
EXPOSE 4200
CMD ["node", "server/server.mjs"]
