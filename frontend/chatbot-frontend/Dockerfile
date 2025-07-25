# Build React app
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Create env file at build time
ARG REACT_APP_API_PROTOCOL
ARG REACT_APP_WS_PROTOCOL
ARG REACT_APP_BACKEND_HOST
ARG REACT_APP_BACKEND_PORT

ENV REACT_APP_API_PROTOCOL=$REACT_APP_API_PROTOCOL
ENV REACT_APP_WS_PROTOCOL=$REACT_APP_WS_PROTOCOL
ENV REACT_APP_BACKEND_HOST=$REACT_APP_BACKEND_HOST
ENV REACT_APP_BACKEND_PORT=$REACT_APP_BACKEND_PORT

RUN npm run build

# Serve with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 