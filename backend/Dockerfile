FROM node:22-alpine AS build_image
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build_image /app/node_modules ./node_modules
COPY --from=build_image /app/dist ./dist
EXPOSE 5001
CMD ["node", "dist/server.js"]