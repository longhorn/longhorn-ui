FROM node:10 as builder
RUN apt-get update -y && \
    apt-get install -y gettext-base
RUN mkdir /web
WORKDIR /web
COPY . /web
RUN npm install
ARG VERSION
ENV VERSION ${VERSION}
RUN envsubst '${VERSION}' < /web/src/utils/config.js > /web/src/utils/config.js.subst && mv /web/src/utils/config.js.subst /web/src/utils/config.js
RUN npm run build

FROM nginx:1.20.1-alpine
RUN apk update && \
    apk add --upgrade --no-cache curl && \
    apk add --upgrade --no-cache libxml2 && \
    apk add bash && \
    apk add gettext && \
    apk add shadow && \
    rm -rf /var/cache/apk/*                 
RUN mkdir -p web/dist
WORKDIR /web
COPY --from=builder /web/dist /web/dist
COPY --from=builder /web/nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 8000
ENV LONGHORN_MANAGER_IP http://localhost:9500

CMD ["/bin/bash", "-c", "envsubst '${LONGHORN_MANAGER_IP}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
