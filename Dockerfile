FROM node
MAINTAINER logan@rancher.com

COPY package.json /tmp/package.json
RUN cd /tmp && npm install --registry=https://registry.npm.taobao.org
RUN mkdir -p /web && cp -a /tmp/node_modules /web

VOLUME /dist

COPY . /web
WORKDIR /web

RUN npm run build
RUN npm install http-server@indexzero/http-server -g --registry=https://registry.npm.taobao.org

WORKDIR /web/dist

CMD ["http-server", ".", "-g", "-p", "8000"]
