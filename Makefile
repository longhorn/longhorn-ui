NS = rancher
VERSION ?= latest

REPO = longhorn-ui
NAME = longhorn-ui
INSTANCE = default
LONHORN_MANAGER_IP = http://localhost:9500
PORT = 8000

.PHONY: build push shell run start stop rm release

build:
	docker build -t $(NS)/$(REPO):$(VERSION) .

stop:
	docker stop $(NAME)-$(INSTANCE)

run:
	docker run -d --rm --name $(NAME)-$(INSTANCE) -p $(PORT):8000 -e LONGHORN_MANAGER_IP=$(LONGHORN_MANAGER_IP) $(NS)/$(REPO):$(VERSION)

default: build
