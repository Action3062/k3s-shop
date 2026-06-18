# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl git
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build
# ---- runtime ----
FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl git
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
EXPOSE 8080
CMD ["node", "dist/src/server.js"]
