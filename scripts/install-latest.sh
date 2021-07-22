#!/bin/bash
set -e

reset="\e[0m"
red="\e[0;31m"

printf "${red}This script has moved to https://spkgmpkg.com/install.sh, please update your URL!$reset\n"
curl --compressed -o- -L https://spkgmpkg.com/install.sh | bash -s -- "$@"
