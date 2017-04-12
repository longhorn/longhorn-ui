FROM luissalgadofreire/nginx-node:6.x
MAINTAINER logan@rancher.com

COPY package.json /tmp/package.json
RUN cd /tmp && npm install --registry=https://registry.npm.taobao.org
RUN mkdir -p /web && cp -a /tmp/node_modules /web
COPY nginx.conf.template /etc/nginx/nginx.conf.template

COPY . /web
WORKDIR /web

EXPOSE 8000
ENV LONGHORN_ORC_IP http://localhost:9500
RUN npm run build
COPY /dist /dist

CMD ["/bin/bash", "-c", "envsubst '${LONGHORN_ORC_IP}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
