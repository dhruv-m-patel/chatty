#!/bin/bash

REPO_URL="${REPO_URL:=583319123885.dkr.ecr.us-east-2.amazonaws.com}"

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" || -z "$AWS_REGION" ]]; then
  echo "AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables must be present!"
  exit 1
fi

aws="docker run --rm -it -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY amazon/aws-cli"

echo "Attempting to login to $REPO_URL..."
$aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URL
echo "Success!"