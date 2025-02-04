VERSION = $(shell ./scripts/version)
MACHINE := longhorn
# Define the target platforms that can be used across the ecosystem.
# Note that what would actually be used for a given project will be
# defined in TARGET_PLATFORMS, and must be a subset of the below:
DEFAULT_PLATFORMS := linux/amd64,linux/arm64

REPO = longhornio
NAME = longhorn-ui
INSTANCE = default
LONGHORN_MANAGER_IP = http://localhost:9500
PORT = 8000

BASE_IMAGE = $(shell grep FROM Dockerfile | grep -vi ' AS ' | awk '{print $$2}' )

.PHONY: build push shell run start stop rm release enter

build:
	# update base image to get latest changes
	docker pull ${BASE_IMAGE}
	REPO=$(REPO) IMAGE_NAME=$(NAME) TAG=$(VERSION) VERSION=$(VERSION) bash scripts/package

.PHONY: buildx-machine
buildx-machine:
	@docker buildx create --name=$(MACHINE) --platform=$(DEFAULT_PLATFORMS) 2>/dev/null || true
	docker buildx inspect $(MACHINE)

# variables needed from GHA caller:
# - REPO: image repo, include $registry/$repo_path
# - TAG: image tag
# - TARGET_PLATFORMS: to be passed for buildx's --platform option
# - IID_FILE_FLAG: options to generate image ID file
.PHONY: workflow-image-build-push workflow-image-build-push-secure
workflow-image-build-push: buildx-machine
	MACHINE=$(MACHINE) PUSH='true' VERSION=$(VERSION) bash scripts/package
workflow-image-build-push-secure: buildx-machine
	MACHINE=$(MACHINE) PUSH='true' VERSION=$(VERSION) IS_SECURE=true bash scripts/package

stop:
	docker stop $(NAME)-$(INSTANCE)

run:
	docker run -d --name $(NAME)-$(INSTANCE) -p $(PORT):8000 -e LONGHORN_MANAGER_IP=$(LONGHORN_MANAGER_IP) $(REPO)/$(NAME):$(VERSION)

enter:
	docker exec -it $(NAME)-$(INSTANCE) /bin/bash

default: build
