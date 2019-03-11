/*
 * @Filename: test.js
 * @Author: jin5354
 * @Email: xiaoyanjinx@gmail.com
 * @Last Modified time: 2017-06-24 21:28:35
 */
import 'regenerator-runtime/runtime'
import axios from 'axios'
import test from 'ava'
import wrapper from '../src/index.js'

const pause = function(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

test('wrapped axios feature basis test', async t => {

  let http = wrapper(axios)

  let response1 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  let response2 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577'
  })

  let response3 = await http.get('http://dummy.restapiexample.com/api/v1/employee/7577')

  let response4 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/create',
    method: 'post',
    data: {
      name: 'test' + Date.now(),
      salary: '123',
      age: 23
    }
  })

  let response5 = await http.get('http://dummy.restapiexample.com/api/v1/employee/7577', {
    params: {
      ID: 'somethingelse'
    }
  })

  let response6 = await http.post('http://dummy.restapiexample.com/api/v1/create', {
    name: 'test' + Date.now(),
    salary: '13',
    age: 23
  })

  let response7 = await http.get('http://dummy.restapiexample.com/api/v1/employee/7578', {
    params: {
      ID: 'somethingelse'
    }
  }, 'needless fault-tolerance param')

  t.is(response1.data.id, '7577')
  t.is(response2.data.id, '7577')
  t.is(response3.data.id, '7577')
  t.is(response4.data.salary, '123')
  t.is(response5.data.id, '7577')
  t.is(response6.data.salary, '13')
  t.is(response7.data.id, '7578')
})

test('wrapped axios instance feature basis test', async t => {

  let instance = axios.create({
    withCredentials: false
  })
  instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'

  let http = wrapper(instance)

  let response1 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  let response2 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577'
  })

  let response3 = await http.get('http://dummy.restapiexample.com/api/v1/employee/7577')

  t.is(response1.data.id, '7577')
  t.is(response2.data.id, '7577')
  t.is(response3.data.id, '7577')
})

test('addFilter and removeFilter test', async t => {

  let http = wrapper(axios)
  let reg = /employee/
  t.is(http.__cacher.filters.length, 0)
  http.__addFilter(reg)

  t.is(http.__cacher.filters.length, 1)
  t.truthy(http.__cacher.filters.indexOf(reg) !== -1)
  t.is(http.__cacher.cacheMap.size, 0)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  t.is(http.__cacher.cacheMap.size, 1)
  http.__removeFilter(reg)
  t.is(http.__cacher.filters.length, 0)
  http.__removeFilter(/test/)
  t.is(http.__cacher.filters.length, 0)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7578',
    method: 'get'
  })

  t.is(http.__cacher.cacheMap.size, 1)
})

test('maxCacheSize test', async t => {

  let http = wrapper(axios, {
    maxCacheSize: 3
  })
  let reg = /employee/
  http.__addFilter(reg)

  t.is(http.__cacher.maxCacheSize, 3)
  t.is(http.__cacher.cacheMap.size, 0)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7578',
    method: 'get'
  })
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7579',
    method: 'get'
  })
  t.is(http.__cacher.cacheMap.size, 3)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7580',
    method: 'get'
  })
  t.is(http.__cacher.cacheMap.size, 3)
  t.falsy(http.__cacher.hasCache({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  }))

})

test('ttl test', async t => {

  let http = wrapper(axios, {
    ttl: 1000
  })
  let reg = /employee/
  http.__addFilter(reg)

  t.is(http.__cacher.ttl, 1000)
  t.is(http.__cacher.cacheMap.size, 0)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })
  t.is(http.__cacher.cacheMap.size, 1)
  t.truthy(http.__cacher.hasCache({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  }))

  await pause(1100)

  t.falsy(http.__cacher.hasCache({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  }))

})

test('hit cache test', async t => {

  let http = wrapper(axios)
  let reg = /employee/
  http.__addFilter(reg)

  let response1 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  let response2 = await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  t.is(response1.data.id, '7577')
  t.is(response1.__fromAxiosCache, undefined)
  t.is(response2.data.id, '7577')
  t.is(response2.__fromAxiosCache, true)
})

test('ttl with maxCacheSize test', async t => {

  let http = wrapper(axios, {
    maxCacheSize: 1,
    ttl: 10000
  })
  let reg = /employee/
  http.__addFilter(reg)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })
  t.is(http.__cacher.cacheMap.size, 1)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7578',
    method: 'get'
  })
  t.is(http.__cacher.cacheMap.size, 1)

  await pause(11000)

  t.falsy(http.__cacher.hasCache({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  }))

})

test('with options ignore header', async t => {

  let http = wrapper(axios, {
    excludeHeaders: true
  })
  let reg = /employee/
  http.__addFilter(reg)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get',
    headers: {
      'unique-prop': Math.random().toString()
    }
  })
  t.is(http.__cacher.cacheMap.size, 1)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get',
    headers: {
      'unique-prop': Math.random().toString()
    }
  })
  t.is(http.__cacher.cacheMap.size, 1)
})

test('with out options ignore header', async t => {

  let http = wrapper(axios, {})

  let reg = /employee/
  http.__addFilter(reg)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get',
    headers: {
      'unique-prop': Math.random().toString()
    }
  })
  t.is(http.__cacher.cacheMap.size, 1)
  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get',
    headers: {
      'unique-prop': Math.random().toString()
    }
  })
  t.is(http.__cacher.cacheMap.size, 2)
})

test('clear cache', async t => {

  let http = wrapper(axios)
  let reg = /employee/
  http.__addFilter(reg)

  t.is(http.__cacher.cacheMap.size, 0)
  http.__clearCache()
  t.is(http.__cacher.cacheMap.size, 0)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7577',
    method: 'get'
  })

  t.is(http.__cacher.cacheMap.size, 1)

  await http({
    url: 'http://dummy.restapiexample.com/api/v1/employee/7578',
    method: 'get'
  })

  t.is(http.__cacher.cacheMap.size, 2)

  http.__clearCache()
  t.is(http.__cacher.cacheMap.size, 0)
})
