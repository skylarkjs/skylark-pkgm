/* @flow */

import YarnRegistry from './spkgm-registry.js';
import NpmRegistry from './npm-registry.js';

export const registries = {
  npm: NpmRegistry,
  spkgm: YarnRegistry,
};

export const registryNames = Object.keys(registries);

export type RegistryNames = $Keys<typeof registries>;
export type ConfigRegistries = {
  npm: NpmRegistry,
  spkgm: YarnRegistry,
};
