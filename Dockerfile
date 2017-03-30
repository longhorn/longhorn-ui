FROM node
MAINTAINER logan@rancher.com

COPY package.json /tmp/package.json
RUN cd /tmp && npm install --registry=https://registry.npm.taobao.org
RUN mkdir -p /web && cp -a /tmp/node_modules /web
RUN npm install http-server -g

VOLUME /dist

COPY . /web
WORKDIR /web

RUN npm run build

CMD ["http-server", "./dist", "-p", "8000"]
