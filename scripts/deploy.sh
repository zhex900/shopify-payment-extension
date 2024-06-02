#!/usr/bin/env bash

# Exit if any command fails
set -e

# if it is not in the CI/CD environment, then set the AWS_PROFILE
if [ -z "$GITHUB_RUN_ID" ]; then
  echo "Not in CI/CD environment, setting AWS_PROFILE to stream-dev"
  export REGION=ap-southeast-2 AWS_DEFAULT_REGION=ap-southeast-2 AWS_PROFILE=stream-dev
fi

# set env from .env file
# if .env file exists, then export the variables
if [ -f .env ]; then
  echo "Exporting environment variables from .env file"
  export $(egrep -v '^#' .env | xargs)
fi

if [ -z "$SHOPIFY_API_KEY" ]; then
  echo "SHOPIFY_API_KEY is not set, exiting"
  exit 1
fi

if [ -z "$STAGE" ]; then
  STAGE=$(cat .sst/stage)
fi

# Run the command `sst deploy`, pipe output to STD and capture in a variable
output=$(sst deploy --stage $STAGE | tee /dev/tty)

# Grep lines containing 'ShopifyApp' and save in a variable
shopifyAppUrl=$(echo "$output" | grep 'appUrl:' | grep -o 'https[^ ]*')

appUrlParameterName=$(echo "$output" | grep 'appUrlParameterName:' | grep -o '/[^ ]*app-url')

# Output the captured data
echo "shopifyAppUrl: $shopifyAppUrl"

echo "appUrlParameterName: $appUrlParameterName"

# update ssm parameter with the shopify app url
aws ssm put-parameter \
    --name "$appUrlParameterName" \
    --value "$shopifyAppUrl" \
    --type "String" \
    --overwrite | jq

escaped_url_for_sed=$(echo "$shopifyAppUrl" | sed 's/[\/&]/\\&/g')
sed -i -e "s/http.*:\/\/.*\.[a-z]*/$escaped_url_for_sed/g" ./shopify.app.toml
sed -i -e "s/client_id.*$/client_id = \"$SHOPIFY_API_KEY\"/" ./shopify.app.toml

# if $COMMIT_URL is not set, then set it to the latest commit
if [ -z "$COMMIT_URL" ]; then
  echo "COMMIT_URL is not set, setting it to the latest commit"
  export COMMIT_URL=$(git rev-parse HEAD)
fi

#shopify app deploy --force --source-control-url "$COMMIT_URL"

# if it is not in the CI/CD environment,
if [ -z "$GITHUB_RUN_ID" ]; then
  # reformat the code
  npx prettier --write .
fi
