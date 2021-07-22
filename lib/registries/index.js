'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registryNames = exports.registries = undefined;

var _spkgmRegistry;

function _load_spkgmRegistry() {
  return _spkgmRegistry = _interopRequireDefault(require('./spkgm-registry.js'));
}

var _npmRegistry;

function _load_npmRegistry() {
  return _npmRegistry = _interopRequireDefault(require('./npm-registry.js'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const registries = exports.registries = {
  npm: (_npmRegistry || _load_npmRegistry()).default,
  spkgm: (_spkgmRegistry || _load_spkgmRegistry()).default
};

const registryNames = exports.registryNames = Object.keys(registries);