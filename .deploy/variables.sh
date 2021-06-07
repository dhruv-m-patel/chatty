#!/bin/bash

set -e

AUTH_SERVICE_VERSION="${AUTH_SERVICE_VERSION:=0.0.6}"
USERS_SERVICE_VERSION="${USERS_SERVICE_VERSION:=0.0.6}"
HIGH_FIVE_SERVICE_VERSION="${HIGH_FIVE_SERVICE_VERSION:=0.0.6}"
PROXY_SERVICE_VERSION="${PROXY_SERVICE_VERSION:=0.0.5}"
KONG_VERSION="${KONG_VERSION:=0.0.8}"
ENTITY_HISTORY_SERVICE_VERSION="${ENTITY_HISTORY_SERVICE_VERSION:=0.0.4}"

AUTH_SERVICE_IMAGE_NAME="${AUTH_SERVICE_IMAGE_NAME:=auth-service}"
USERS_SERVICE_IMAGE_NAME="${USERS_SERVICE_IMAGE_NAME:=users-service}"
HIGH_FIVE_SERVICE_IMAGE_NAME="${HIGH_FIVE_SERVICE_IMAGE_NAME:=high-five-service}"
PROXY_SERVICE_IMAGE_NAME="${PROXY_SERVICE_IMAGE_NAME:=proxy-service}"
KONG_IMAGE_NAME="${KONG_IMAGE_NAME:=kong-gateway}"
ENTITY_HISTORY_SERVICE_IMAGE_NAME="${ENTITY_HISTORY_SERVICE_IMAGE_NAME:=entity-history-service}"

REPO_URL="${REPO_URL:=583319123885.dkr.ecr.us-east-2.amazonaws.com}"
REPO_NAME="${REPO_NAME:=wildbreeze}"

REPO_FQN="$REPO_URL/$REPO_NAME"

export AUTH_SERVICE_IMAGE="${AUTH_SERVICE_IMAGE:-$REPO_FQN:${AUTH_SERVICE_IMAGE_NAME}-${AUTH_SERVICE_VERSION}}"
export USERS_SERVICE_IMAGE="${USERS_SERVICE_IMAGE:-$REPO_FQN:${USERS_SERVICE_IMAGE_NAME}-${USERS_SERVICE_VERSION}}"
export HIGH_FIVE_SERVICE_IMAGE="${HIGH_FIVE_SERVICE_IMAGE:-$REPO_FQN:${HIGH_FIVE_SERVICE_IMAGE_NAME}-${HIGH_FIVE_SERVICE_VERSION}}"
export PROXY_SERVICE_IMAGE="${PROXY_SERVICE_IMAGE:-$REPO_FQN:${PROXY_SERVICE_IMAGE_NAME}-${PROXY_SERVICE_VERSION}}"
export KONG_IMAGE="${KONG_IMAGE:-$REPO_FQN:${KONG_IMAGE_NAME}-${KONG_VERSION}}"
export ENTITY_HISTORY_SERVICE_IMAGE="${ENTITY_HISTORY_SERVICE_IMAGE:-$REPO_FQN:${ENTITY_HISTORY_SERVICE_IMAGE_NAME}-${ENTITY_HISTORY_SERVICE_VERSION}}"

echo "Auth Service Image: $AUTH_SERVICE_IMAGE"
echo "Users Service Image: $USERS_SERVICE_IMAGE"
echo "HF Service Image: $HIGH_FIVE_SERVICE_IMAGE"
echo "Proxy Service Image: $PROXY_SERVICE_IMAGE"
echo "Kong Image: $KONG_IMAGE"
echo "Entity History Image: $ENTITY_HISTORY_SERVICE_IMAGE"

export KONG_LISTENER_PORT=80
