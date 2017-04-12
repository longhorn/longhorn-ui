FROM luissalgadofreire/nginx-node:6.x
MAINTAINER logan@rancher.com

COPY package.json /tmp/package.json
RUN cd /tmp && npm install --registry=https://registry.npm.taobao.org
RUN mkdir -p /web && cp -a /tmp/node_modules /web
RUN npm run build
COPY nginx.conf /etc/nginx/nginx.conf
COPY /dist /dist

CMD ["nginx", "-g", "daemon off;"]
