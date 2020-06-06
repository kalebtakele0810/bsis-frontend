#!/bin/bash

set -o errexit
set -o nounset

# Checkout the latest version
cd /opt/bsis-frontend
git fetch origin ${1:-master}
git checkout FETCH_HEAD

# Install dependencies
npm install

# Build the app
grunt

# Copy the assets to the apache directory
sudo mkdir --parents /var/www/html/bsis
sudo cp --recursive dist/* /var/www/html/bsis
