/*
 * @Filename: cacher.js
 * @Author: jin5354
 * @Email: xiaoyanjinx@gmail.com
 * @Last Modified time: 2017-06-24 21:14:25
 */

export class Cacher {

  constructor(option) {
    this.cacheMap = new Map()
    this.option = option || {}
    this.maxCacheSize = this.option.maxCacheSize || 15
    this.ttl = this.option.ttl
    this.filters = []
    this.excludeHeaders = this.option.excludeHeaders || false
  }

  /**
   * [addFilter 添加匹配规则]
   * @param {[reg]} reg
   */
  addFilter(reg) {
    this.filters.push(reg)
  }

  /**
   * [removeFilter 移除匹配规则]
   * @param  {[reg]} reg
   */
  removeFilter(reg) {
    let index = this.filters.indexOf(reg)
    if(index !== -1) {
      this.filters.splice(index, 1)
    }
  }

  /**
   * [setCache 添加缓存]
   * @param {[any]} key
   * @param {[any]} value
   */
  setCache(key, value) {
    if(this.excludeHeaders) delete key.headers

    this.cacheMap.set(JSON.stringify(key), value)
    if(this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
      this.cacheMap.delete([...(this.cacheMap).keys()][0])
    }
    if(this.ttl) {
      setTimeout(() => {
        if(this.hasCache(key)) {
          this.cacheMap.delete(JSON.stringify(key))
        }
      }, this.ttl)
    }
  }

  /**
   * [needCache 检查是否命中匹配规则]
   * @param  {[obj]} option
   * @return {[boolean]}
   */
  needCache(option) {
    return this.filters.some(reg => {
      return reg.test(option.url)
    })
  }

  /**
   * [hasCache 是否已有缓存]
   * @param  {[any]}  key
   * @return {Boolean}
   */
  hasCache(key) {
    return this.cacheMap.has(JSON.stringify(key))
  }

  /**
   * [getCache 获取缓存内容]
   * @param  {[any]} key
   * @return {[any]}
   */
  getCache(key) {
    return this.cacheMap.get(JSON.stringify(key))
  }

  /**
   * [clear 清空缓存]
   */
  clear() {
    this.cacheMap.clear()
  }

}
