FROM node
MAINTAINER logan@rancher.com

COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /web && cp -a /tmp/node_modules /web

VOLUME /dist

COPY . /web
WORKDIR /web

RUN npm run build

CMD ["superstatic", "dist", "--gzip", "true", "--port", "8000", "--host", "0.0.0.0"]
