# Image URL to use all building/pushing image targets
IMG ?= kuromesi/modeling-tool:latest
WEBAPP_PORT=4000

server-start: ## start the matlab service caller
	python ResilienceMeasure/server.py

docker-build: ## Build docker image with the webapp.
	docker build -t ${IMG} webapp

docker-push: ## Push docker image with the webapp.
	docker push ${IMG}

webapp-start:
	docker run -itd --rm -p ${WEBAPP_PORT}:4000 -v projects:/app/projects -v config.yaml:/app/config/config.yaml ${IMG}