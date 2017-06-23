/*
 * @Filename: index.js
 * @Author: jin5354
 * @Email: xiaoyanjinx@gmail.com
 * @Last Modified time: 2017-06-23 16:16:09
 */
import {Cacher} from './cacher.js'

export default function wrapper(instance, option) {

  const cacher = new Cacher(option)

  const unCacheMethods = [
    'delete',
    'head',
    'options',
    'post',
    'put',
    'patch'
  ]

  function axiosWithCache(...arg) {
    if(arg.length === 1 && (arg[0].method === 'get' || arg[0].method === undefined)) {
      return requestWithCacheCheck(arg[0], instance, ...arg)
    }else {
      return instance(...arg)
    }
  }

  function requestWithCacheCheck(option, func, ...arg) {
    if(cacher.needCache(option)) {
      if(cacher.hasCache(option)) {
        console.log('命中！')
        return Promise.resolve(cacher.getCache(option))
      }else {
        console.log('未命中，进缓存。')
        return func(...arg).then(response => {
          cacher.setCache(option, response)
          return response
        })
      }
    }else {
      return instance(...arg)
    }
  }

  axiosWithCache.get = function(...arg) {
    if(arg.length === 1) {
      return requestWithCacheCheck({
        url: arg[0]
      }, instance.get, ...arg)
    }else if(arg.length === 2) {
      return requestWithCacheCheck({
        url: arg[0],
        ...arg[1]
      }, instance.get, ...arg)
    }else {
      return instance.get(...arg)
    }
  }

  axiosWithCache.__addFilter = function(filter) {
    cacher.addFilter(filter)
  }

  axiosWithCache.__removeFilter = function(filter) {
    cacher.removeFilter(filter)
  }

  unCacheMethods.forEach(method => {
    axiosWithCache[method] = function(...arg) {
      return instance[method](...arg)
    }
  })

  return axiosWithCache
}
