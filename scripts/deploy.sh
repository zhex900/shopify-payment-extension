#!/usr/bin/env bash

# Run the command `sst deploy`, pipe output to STD and capture in a variable
output=$(sst deploy | tee /dev/tty)

# Grep lines containing 'ShopifyApp' and save in a variable
shopifyAppUrl=$(echo "$output" | grep 'appUrl:' | grep -o 'https[^ ]*')

appUrlParameterName=$(echo "$output" | grep 'appUrlParameterName:' | grep -o '/[^ ]*app-url')

# Output the captured data
echo "Output containing ShopifyApp:"
echo "$shopifyAppUrl"

echo "Output containing appUrlParameterName:"
echo "$appUrlParameterName"

# update ssm parameter with the shopify app url
aws ssm put-parameter \
    --name "$appUrlParameterName" \
    --value "$shopifyAppUrl" \
    --type "String" \
    --overwrite | jq

sed -i '' "s|https.*com|$shopifyAppUrl|g" ./shopify.app.toml

shopify app deploy --force
