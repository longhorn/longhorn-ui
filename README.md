# Longhorn UI
[![Build Status](https://drone-publish.rancher.io/api/badges/longhorn/longhorn-ui/status.svg)](https://drone-publish.rancher.io/longhorn/longhorn-ui)
--------

Admin UI for Longhorn Manger

## Usage

Prerequisites:
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

Setup:
```bash
  git clone 'https://github.com/rancher/longhorn-ui'
  cd 'longhorn-ui'
  npm install
```
Run development server pointed at some Longhorn Manager API
```bash
  LONGHORN_MANAGER_IP="http://longhorn:9500/" npm run dev
```
Compiling for distribution
```bash
  npm run build
```

Build and run a docker image
```bash
  make
  make LONGHORN_MANAGER_IP=http://longhorn:9500 run
```

## Contribution

Please check [the main repo](https://github.com/longhorn/longhorn#community) for the contributing guide.


License
=======
Copyright (c) 2014-2019 The Longhorn Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
