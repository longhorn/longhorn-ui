# Longhorn UI
--------

Admin UI for Longhorn Manger

## Usage

Prerequisites:
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

Setup:
```bash
  git clone 'https://github.com/rancher/longhron-ui'
  cd 'longhron-ui'
  npm install
```
Run development server pointed at some Longhron Manger API
```bash
  LONGHORN_MANAGER_IP="http://longhorn:9500/" npm run dev
```
Compiling for distribution
```bash
  npm run build
```

Build and run a docker image
```bash
  docker build .
  docker run -d -p 8000:8000 -e LONGHORN_MANAGER_IP=http://longhron:9500 THE_IMAGE_ID
```

License
=======
Copyright (c) 2014-2016 [Rancher Labs, Inc.](http://rancher.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
