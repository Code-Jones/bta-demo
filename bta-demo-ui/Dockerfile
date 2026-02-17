FROM oven/bun:1.1.30 AS build
WORKDIR /app
COPY bta-demo-ui/ ./bta-demo-ui/
WORKDIR /app/bta-demo-ui
ARG VITE_API_BASE_URL=https://api.contractor-os.xyz
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN bun install
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/bta-demo-ui/dist/ /usr/share/nginx/html/
COPY bta-demo-ui/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80