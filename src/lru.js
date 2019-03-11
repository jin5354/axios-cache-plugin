class LinkNode {
  constructor(key, value) {
    this.key = key
    this.value = value
  }
}

export default class LRUCache {
  hashMap = {}
  num = 0

  constructor(capacity) {
    this.capacity = capacity
  }

  get(key) {
    if(this.hashMap[key] !== undefined) {
      this._addToTail(this.hashMap[key])
      return this.hashMap[key].value
    }else {
      return -1
    }
  }

  put(key, value) {
    if(this.hashMap[key]) {
      this.hashMap[key].value = value
      this._addToTail(this.hashMap[key])
    }else if(this.num >= this.capacity){
      // 删掉最近最少访问的，再添加..
      this._removeLRU()
      this.hashMap[key] = new LinkNode(key, value)
      this._addToTail(this.hashMap[key])
      this.num++
    }else {
      // 直接添加
      this.hashMap[key] = new LinkNode(key, value)
      this._addToTail(this.hashMap[key])
      this.num++
    }
  }

  _addToTail(node) {
    // 添加的第一个元素。初始化 head 和 tail
    if(!this.tail) {
      this.head = this.tail = node
      return
    }
    // 该元素本就是 tail，不变。
    if(this.tail === node) {
      return
    }
    let prev = node.prev
    let next = node.next

    // 该元素在中间，移除，修正前后节点
    if(prev && next) {
      prev.next = next
      next.prev = prev
      node.next = null
    }

    // 该元素是 head，放到最后面。head 更新
    if(!prev && next) {
      next.prev = null
      this.head = next
    }

    // 更新 tail
    this.tail.next = node
    node.prev = this.tail
    this.tail = node
    node.next = null
  }

  // 移除最近最少使用节点
  _removeLRU() {
    let target = this.head
    let next = target.next
    if(next) {
      next.prev = null
      this.head = next
    }else {
      this.head = null
      this.tail = null
    }
    delete this.hashMap[target.key]
    this.num--
  }
}