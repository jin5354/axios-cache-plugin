/*
 * @Filename: cacher.js
 * @Author: jin5354
 * @Email: xiaoyanjinx@gmail.com
 * @Last Modified time: 2017-06-23 18:05:13
 */

export class Cacher {

  constructor(option) {
    this.cacheMap = new Map()
    this.option = option || {}
    this.maxCacheSize = option.maxCacheSize || 15
    this.ttl = option.ttl
    this.filters = []
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
   * [getCache 获取缓存内容]
   * @param  {[any]} key
   * @return {[any]}
   */
  getCache(key) {
    return this.cacheMap.get(JSON.stringify(key))
  }

}
