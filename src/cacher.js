/*
 * @Filename: cacher.js
 * @Author: jin5354
 * @Email: xiaoyanjinx@gmail.com
 * @Last Modified time: 2017-06-23 14:49:53
 */

export class Cacher {

  constructor(option) {
    this.cacheMap = new Map()
    this.option = option
    this.maxCacheSize = option.maxCacheSize
    this.ttl = option.ttl
    this.filters = []
  }

  addFilter(reg) {
    this.filters.push(reg)
  }

  removeFilter(reg) {
    let index = this.filters.indexOf(reg)
    if(index !== -1) {
      this.filters.splice(index, 1)
    }
  }

  setCache(key, value) {
    this.cacheMap.set(JSON.stringify(key), value)
    if(this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
      this.cacheMap.delete([...(this.cacheMap).keys()][0])
    }
    if(this.ttl) {
      setTimeout(() => {
        this.cacheMap.delete(key)
      }, this.ttl)
    }
  }

  needCache(key) {
    return this.filters.some(reg => {
      return reg.test(key.url)
    })
  }

  hasCache(key) {
    return this.cacheMap.has(JSON.stringify(key))
  }

  getCache(key) {
    return this.cacheMap.get(JSON.stringify(key))
  }

}
