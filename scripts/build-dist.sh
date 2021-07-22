#!/bin/bash
set -Exu
set -o pipefail
# Builds the release tarball for Yarn.

umask 0022 # Ensure permissions are correct (0755 for dirs, 0644 for files)

# Workaround for https://github.com/spkgmpkg/spkgm/issues/2591
case "$(uname -s)" in
  *CYGWIN*|MSYS*|MINGW*)
    system_spkgm=spkgm.cmd
    ;;
  *)
    system_spkgm=spkgm
    ;;
esac

version=`node -p "require('./package.json').version"`
node_version=`node -p "process.versions.node.split('.')[0]"`

rm -rf artifacts dist
mkdir artifacts
mkdir dist{,/bin,/lib}

# Workaround for https://github.com/spkgmpkg/spkgm/issues/2591
eval $system_spkgm run build
eval $system_spkgm run build-bundle
chmod +x artifacts/*.js
# Verify that it works as expected
if (( node_version > 4 )); then
  [[ "$version" == "$(node artifacts/spkgm-$version.js --version)" ]] || exit 1
fi
[[ "$version" == "$(node artifacts/spkgm-legacy-$version.js --version)" ]] || exit 1

cp package.json dist/
cp README.md dist/
cp LICENSE dist/
# Only use the legacy version for NPM builds so we are compatible
# with any Node >= 4 and still small in terms of size.
cp artifacts/spkgm-legacy-$version.js dist/lib/cli.js
cp bin/{spkgm.js,spkgm,spkgmpkg,*.cmd} dist/bin/
cp scripts/preinstall.js dist/preinstall.js
chmod +x dist/bin/*

# We cannot bundle v8-compile-cache as it must be loaded separately to be effective.
cp node_modules/v8-compile-cache/v8-compile-cache.js dist/lib/v8-compile-cache.js

# Verify that it works as expected
[[ "$version" == "$(./dist/bin/spkgm --version)" ]] || exit 1;

./scripts/update-dist-manifest.js $(node -p "require('fs').realpathSync('dist/package.json')") tar

case "$(tar --version)" in
  *GNU*)
    tar -cvzf artifacts/spkgm-v$version.tar.gz --transform="s/^dist/spkgm-v$version/" dist/*
    ;;
  bsdtar*)
    tar -cvzf artifacts/spkgm-v$version.tar.gz -s "/^dist/spkgm-v$version/" dist/*
    ;;
  *)
    echo "Can't determine tar type (BSD/GNU)!"
    exit 1
    ;;
esac
