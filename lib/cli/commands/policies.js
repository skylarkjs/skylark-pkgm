'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.examples = exports.setFlags = exports.run = undefined;

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

let fetchReleases = (() => {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (config, { includePrereleases = false } = {}) {
    const token = process.env.GITHUB_TOKEN;
    const tokenUrlParameter = token ? `?access_token=${token}` : '';
    const request = yield config.requestManager.request({
      url: `https://api.github.com/repos/spkgmpkg/spkgm/releases${tokenUrlParameter}`,
      json: true
    });

    const releases = request.filter(function (release) {
      if (release.draft) {
        return false;
      }

      if (release.prerelease && !includePrereleases) {
        return false;
      }

      // $FlowFixMe
      release.version = semver.coerce(release.tag_name);

      if (!release.version) {
        return false;
      }

      if (!getBundleAsset(release)) {
        return false;
      }

      return true;
    });

    releases.sort(function (a, b) {
      // $FlowFixMe
      return -semver.compare(a.version, b.version);
    });

    return releases;
  });

  return function fetchReleases(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.hasWrapper = hasWrapper;

var _buildSubCommands2;

function _load_buildSubCommands() {
  return _buildSubCommands2 = _interopRequireDefault(require('./_build-sub-commands.js'));
}

var _rc;

function _load_rc() {
  return _rc = require('../../rc.js');
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../../util/fs.js'));
}

var _lockfile;

function _load_lockfile() {
  return _lockfile = require('../../lockfile');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chalk = require('chalk');
const invariant = require('invariant');
const path = require('path');
const semver = require('semver');

function getBundleAsset(release) {
  return release.assets.find(asset => {
    return asset.name.match(/^spkgm-[0-9]+\.[0-9]+\.[0-9]+\.js$/);
  });
}

function fetchBundle(config, url) {
  return config.requestManager.request({
    url,
    buffer: true
  });
}

function hasWrapper(flags, args) {
  return false;
}

var _buildSubCommands = (0, (_buildSubCommands2 || _load_buildSubCommands()).default)('policies', {
  setVersion(config, reporter, flags, args) {
    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      let range = args[0] || 'latest';
      let allowRc = flags.rc;

      reporter.log(`Resolving ${chalk.yellow(range)} to a url...`);

      if (range === 'rc') {
        range = 'latest';
        allowRc = true;
      }

      if (range === 'latest') {
        range = '*';
      }

      let bundleUrl;
      let bundleVersion;
      let isV2 = false;

      if (range === 'nightly' || range === 'nightlies') {
        bundleUrl = 'https://nightly.spkgmpkg.com/latest.js';
        bundleVersion = 'nightly';
      } else if (range === 'berry' || range === 'v2' || range === '2') {
        bundleUrl = 'https://github.com/spkgmpkg/berry/raw/master/packages/berry-cli/bin/berry.js';
        bundleVersion = 'berry';
        isV2 = true;
      } else {
        let releases = [];

        try {
          releases = yield fetchReleases(config, {
            includePrereleases: allowRc
          });
        } catch (e) {
          reporter.error(e.message);
          return;
        }

        const release = releases.find(function (release) {
          // $FlowFixMe
          return semver.satisfies(release.version, range);
        });

        if (!release) {
          throw new Error(`Release not found: ${range}`);
        }

        const asset = getBundleAsset(release);
        invariant(asset, 'The bundle asset should exist');

        bundleUrl = asset.browser_download_url;
        bundleVersion = release.version.version;
      }

      reporter.log(`Downloading ${chalk.green(bundleUrl)}...`);

      const bundle = yield fetchBundle(config, bundleUrl);

      const spkgmPath = path.resolve(config.lockfileFolder, `.spkgm/releases/spkgm-${bundleVersion}.cjs`);
      reporter.log(`Saving it into ${chalk.magenta(spkgmPath)}...`);
      yield (_fs || _load_fs()).mkdirp(path.dirname(spkgmPath));
      yield (_fs || _load_fs()).writeFile(spkgmPath, bundle);
      yield (_fs || _load_fs()).chmod(spkgmPath, 0o755);

      const targetPath = path.relative(config.lockfileFolder, spkgmPath).replace(/\\/g, '/');

      if (isV2) {
        const rcPath = `${config.lockfileFolder}/.spkgmrc.yml`;
        reporter.log(`Updating ${chalk.magenta(rcPath)}...`);

        yield (_fs || _load_fs()).writeFilePreservingEol(rcPath, `spkgmPath: ${JSON.stringify(targetPath)}\n`);
      } else {
        const rcPath = `${config.lockfileFolder}/.spkgmrc`;
        reporter.log(`Updating ${chalk.magenta(rcPath)}...`);

        const rc = (0, (_rc || _load_rc()).getRcConfigForFolder)(config.lockfileFolder);
        rc['spkgm-path'] = targetPath;

        yield (_fs || _load_fs()).writeFilePreservingEol(rcPath, `${(0, (_lockfile || _load_lockfile()).stringify)(rc)}\n`);
      }

      reporter.log(`Done!`);
    })();
  }
});

const run = _buildSubCommands.run,
      setFlags = _buildSubCommands.setFlags,
      examples = _buildSubCommands.examples;
exports.run = run;
exports.setFlags = setFlags;
exports.examples = examples;