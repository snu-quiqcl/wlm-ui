FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY public ./public
COPY src ./src

RUN yarn install --frozen-lockfile
RUN yarn build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl /etc/nginx/ssl

RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run /var/log/nginx

USER nginx

EXPOSE 8080 8443

CMD ["nginx", "-g", "daemon off;"]
