FROM node:16.20 as builder
RUN apt-get update -y && \
    apt-get install -y gettext-base
RUN mkdir /web
WORKDIR /web
COPY . /web
RUN npm ci
ARG VERSION
ENV VERSION ${VERSION}
RUN envsubst '${VERSION}' < /web/src/utils/config.js > /web/src/utils/config.js.subst && mv /web/src/utils/config.js.subst /web/src/utils/config.js
RUN npm run build

FROM registry.suse.com/bci/bci-base:15.6

RUN zypper -n ref && \
    zypper update -y

RUN zypper -n install curl libxml2 bash gettext shadow nginx && \
    rm -f /bin/sh && ln -s /bin/bash /bin/sh

RUN mkdir -p web/dist
WORKDIR /web

COPY --from=builder /web/dist /web/dist
COPY --from=builder /web/nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 8000
ENV LONGHORN_MANAGER_IP http://localhost:9500
ENV LONGHORN_UI_PORT 8000

RUN mkdir -p /var/config/ && touch /var/run/nginx.pid && chown -R 499 /var/config /var/run/nginx.pid

# Use the uid of the default user (nginx) from the installed nginx package
USER 499

CMD ["/bin/bash", "-c", "mkdir -p /var/config/nginx/ && cp -r /etc/nginx/* /var/config/nginx/; envsubst '${LONGHORN_MANAGER_IP},${LONGHORN_UI_PORT}' < /etc/nginx/nginx.conf.template > /var/config/nginx/nginx.conf && nginx -c /var/config/nginx/nginx.conf -g 'daemon off;'"]
