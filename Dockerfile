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

FROM registry.suse.com/bci/bci-base:15.3

RUN zypper -n ref && \
	zypper -n install curl libxml2 bash gettext shadow nginx && \
    rm -f /bin/sh && ln -s /bin/bash /bin/sh

RUN mkdir -p web/dist
WORKDIR /web

COPY --from=builder /web/dist /web/dist
COPY --from=builder /web/nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 8000
ENV LONGHORN_MANAGER_IP http://localhost:9500
ENV LONGHORN_UI_PORT 8000

USER nginx

CMD ["/bin/bash", "-c", "mkdir -p /var/config/nginx/ && cp -r /etc/nginx/* /var/config/nginx/; envsubst '${LONGHORN_MANAGER_IP},${LONGHORN_UI_PORT}' < /etc/nginx/nginx.conf.template > /var/config/nginx/nginx.conf && nginx -c /var/config/nginx/nginx.conf -g 'daemon off;'"]
