VERSION = $(shell ./scripts/version)

REPO = longhornio
NAME = longhorn-ui
INSTANCE = default
LONHORN_MANAGER_IP = http://localhost:9500
PORT = 8000
IMAGE = $(REPO)/$(NAME):$(VERSION)

BASE_IMAGE = $(shell grep FROM Dockerfile | grep -vi ' AS ' | awk '{print $$2}' )

.PHONY: build push shell run start stop rm release

build:
	# update base image to get latest changes
	docker pull ${BASE_IMAGE}
	docker build -t $(IMAGE) --build-arg VERSION=$(VERSION) .
	@echo Build $(IMAGE) successful
	@mkdir -p bin
	@echo $(IMAGE) > bin/latest_image

stop:
	docker stop $(NAME)-$(INSTANCE)

run:
	docker run -d --name $(NAME)-$(INSTANCE) -p $(PORT):8000 -e LONGHORN_MANAGER_IP=$(LONGHORN_MANAGER_IP) $(REPO)/$(NAME):$(VERSION)

default: build
