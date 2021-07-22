# spkgm-lockfile

Parse and/or write `spkgm.lock` files

## Usage Examples

```js
const fs = require('fs');
const lockfile = require('@spkgmpkg/lockfile');
// or (es6)
import fs from 'fs';
import * as lockfile from '@spkgmpkg/lockfile';

let file = fs.readFileSync('spkgm.lock', 'utf8');
let json = lockfile.parse(file);

console.log(json);

let fileAgain = lockfile.stringify(json);

console.log(fileAgain);
```
