#!/bin/bash
# Bootstraps a Yarn development environment on Ubuntu.
set -ex

# Add Yarn package repo - We require Yarn to build Yarn itself :D
sudo apt-key adv --fetch-keys http://dl.spkgmpkg.com/debian/pubkey.gpg
echo "deb http://dl.spkgmpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/spkgm.list

sudo apt-get update -qq
sudo apt-get install -y rpm lintian spkgm
gem install fpm
