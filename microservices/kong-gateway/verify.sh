#!/bin/bash

# If any command fails, abort :)
set -e

export CLUSTER_HOST="${CLUSTER_HOST:=localhost}"
export CLUSTER_PORT="${CLUSTER_PORT:=8000}"
export CURL_BIN="${CURL_BIN:=docker run --net=host --rm curlimages/curl}"
export JQ_BIN="${JQ_BIN:=docker run --rm -i imega/jq}"

checkServiceHealth(){
  SERVICE_NAME=$1
  HEALTH_ENDPOINT="${2:-$SERVICE_NAME/api/health}"

  URL="${CLUSTER_HOST}:${CLUSTER_PORT}/${HEALTH_ENDPOINT}"
  
  echo "Verifying $SERVICE_NAME service at $URL..."
  
  res=`$CURL_BIN -s -X GET -w "\n%{json}" --url "$URL"`

  http_code=$(echo "$res" | tail -n 1 | $JQ_BIN .response_code)
  body=$(echo "$res" | sed '$d')

  if [ "$http_code" != "200" ]; then
    echo "Could not verify $SERVICE_NAME service health"
    echo "$body"
    exit 2
  else
    echo "$SERVICE_NAME service healthy :)"
    echo "$body"
  fi
}

checkServiceHealth "auth"
checkServiceHealth "high-fives"
checkServiceHealth "users"
checkServiceHealth "entity-history"
checkServiceHealth "proxy"
checkServiceHealth "safety-intelligence"
