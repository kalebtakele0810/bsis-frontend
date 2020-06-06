#!/bin/bash

set -o errexit
set -o nounset

sudo apt-get update

# Set up the nodejs package repository
curl --silent --location https://deb.nodesource.com/setup_0.12 | sudo bash -

# Install packages
sudo apt-get install --quiet --assume-yes \
  nodejs \
  git \
  libfontconfig1

if ! fgrep --silent ".npm-packages" ~/.profile; then
  # Configure the directory for global npm installs
  echo "prefix = ${HOME}/.npm-packages" > ~/.npmrc
  echo 'export PATH="${HOME}/.npm-packages/bin:${PATH}"' >> ~/.profile
fi

source ~/.profile

# Install grunt and bower
npm install --global bower grunt-cli

# Install dependencies
cd /opt/bsis-frontend
npm install
