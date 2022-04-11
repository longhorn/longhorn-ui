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
    apk upgrade && \
    apk add curl && \
    apk add bash && \
    apk add gettext && \
    apk add shadow && \
    rm -rf /var/cache/apk/*
RUN mkdir -p web/dist
WORKDIR /web
COPY --from=builder /web/dist /web/dist
COPY --from=builder /web/nginx.conf.template /etc/nginx/nginx.conf.template

ENV LONGHORN_MANAGER_IP http://localhost:9500
ENV LONGHORN_UI_PORT 8000

RUN useradd -r -u 1000 longhorn
USER 1000

CMD ["/bin/bash", "-c", "mkdir -p /var/config/nginx/ && cp -r /etc/nginx/* /var/config/nginx/; envsubst '${LONGHORN_MANAGER_IP},${LONGHORN_UI_PORT}' < /etc/nginx/nginx.conf.template > /var/config/nginx/nginx.conf && nginx -c /var/config/nginx/nginx.conf -g 'daemon off;'"]
