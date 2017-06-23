# axios-cache-plugin

[![Build Status](https://travis-ci.org/jin5354/axios-cache-plugin.svg?branch=master)](https://travis-ci.org/jin5354/axios-cache-plugin)
[![Coverage Status](https://coveralls.io/repos/github/jin5354/axios-cache-plugin/badge.svg?branch=master)](https://coveralls.io/github/jin5354/axios-cache-plugin?branch=master)

Help you cache GET request when using axios.

## Install

```bash
npm install axios-cache-plugin --save-dev
```
or
```bash
yarn add axios-cache-plugin
```

## Usage

Add cache feature to axios

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin'

let http = wrapper(axios, {
  maxCacheSize: 15
})
export default http
```

or axios instance

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin'

let http = axios.create({
  withCredentials: false
})

let httpProxy = wrapper(axios, {
  maxCacheSize: 15
})
export default httpProxy
```

## API

By default, `axios-cache-plugin` won't cache any GET request unless you add filters.

Filters are Regexps, only the GET request whose url hit the filter reg will be cached.

### instance.__addFilter(reg)

example:

```javascript
import axios from 'axios'
import wrapper from 'axios-cache-plugin'

let http = wrapper(axios, {
  maxCacheSize: 15
})
http.__addFilter(/getItemInfoByIdsWithSecKill/)

http({
  url: 'http://example.com/item/getItemInfoByIdsWithSecKill',
  method: 'get',
  params: {
    param: JSON.stringify({
      debug_port: 'sandbox1'
    })
  }
})

// now the request http://example.com/item/getItemInfoByIdsWithSecKill?param=%7B%22debug_port%22:%22sandbox1%22%7D has been cached
```

### instance.__removeFilter(reg)

## wrapper options

Options are optional.

```
let http = wrapper(axios, {
  maxCacheSize: 15,  // cached items amounts. if the number of cached items exceeds, the earliest cached item will be deleted. default number is 15.
  ttl: 60000 // time to live. if you set this option the cached item will be auto deleted after ttl(ms).
})
```

## LICENSE

MIT

