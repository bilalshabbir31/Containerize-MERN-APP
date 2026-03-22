FROM node:22-alpine AS build_image
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=build_image /app/node_modules ./node_modules
COPY --from=build_image /app/dist .
COPY --from=build_image /app/prisma ./prisma
COPY --from=build_image /app/prisma.config.js .
COPY --from=build_image /app/bin/entrypoint.sh .
RUN chmod +x entrypoint.sh
EXPOSE 5001
CMD ["./entrypoint.sh"]