/**
 * Created by John Gorven on 2017/1/1.
 */
var gar = {}
/**
 * ajax
 */
gar.ajax = function (url, method, sync, data) {
    // create XMLHttp Obj
  var xhr = new XMLHttpRequest()
    // request cte
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        return xhr.responseText
      } else throw new Error('Request was unsuccessful:' + xhr.status)
    }
  }
    // open
  xhr.open(method, url, sync)
    // send data
  xhr.send(data)
}

gar.addURLParam = function (url, name, val) {
  url += (url.indexOf('?') ? '?' : '&')
  url += encodeURIComponent(name) + '=' + encodeURIComponent(val)
  return url
}

gar.serialize = function (formEle) {

}

gar.sumbitData = function (method, url, asynchronous, fn, formEle) {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)fn()
      else console.info('REQUEST WAS UNSUCCESSFUL: ' + xhr.status)
    }
  }
  xhr.open(method, url, asynchronous)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send(this.serialize(formEle))
}

/**
 * EventUtil
 */
gar.getEvent = function (e) {
  return e || window.event
}
gar.getTarget = function (e) {
  return e.target || e.srcElement
}
gar.getRelatedTarget = function (e) {
  if (e.relatedTarget) {
    this.getRelatedTarget = function (e) {
      return e.relatedTarget
    }
  }
    // IE8 n' -
  else if (e.toElement) {
    this.getRelatedTarget = function (e) {
      return e.toElement
    }
  } else if (e.fromElement) {
    this.getRelatedTarget = function (e) {
      return e.fromElement
    }
  } else {
    this.getRelatedTarget = function () {
      return null
    }
  }
  this.getRelatedTarget(e)
}

gar.preventDefault = function (e) {
  if (e.preventDefault) {
    this.preventDefault = function (e) {
      e.preventDefault()
    }
  } else {
    this.preventDefault = function (e) {
      e.returnValue = true
    }
  }
  this.preventDefault(e)
}

gar.stopProPagation = function (e) {
  if (e.stopProPagation) {
    this.stopProPagation = function (e) {
      e.stopProPagation()
    }
  } else {
    this.stopProPagation = function (e) {
      e.cancelBubble = true
    }
  }
  this.stopProPagation(e)
}

gar.addHandler = function (ele, type, handler, bubble) {
  if (ele.addEventListener) {
    this.addHandler = function (ele, type, handler, bubble) {
      ele.addEventListener(type, handler, bubble)
    }
  } else if (ele.attachEvent) {
    this.addHandler = function (ele, type, handler) {
      ele.attachEvent('on' + type, handler)
    }
  } else {
    this.addHandler = function (ele, type, handler) {
      ele['on' + type] = handler
    }
  }
  this.addHandler(ele, type, handler, bubble)
}

gar.removeHandler = function (ele, type, handler, bubble) {
  if (ele.removeEventListener) {
    this.removeHandler = function (ele, type, handler, bubble) {
      ele.removeEventListener(type, handler, bubble)
    }
  } else if (ele.detachEvent) {
    this.removeHandler = function (ele, type, handler) {
      ele.detachEvent(type, handler, bubble)
    }
  } else {
    this.removeHandler = function (ele, type) {
      ele['on' + type] = null
    }
  }
  this.removeHandler(ele, type, handler, bubble)
}

gar.getCharCode = function (e) {
  if (typeof e.charCode === 'number') {
    this.getCharCode = function (e) {
      return e.charCode
    }
  } else {
    this.getCharCode = function (e) {
      return e.keyCode
    }
  }
  this.getCharCode(e)
}

// aim to mousedown n' mouseup
gar.getButton = function (e) {
  if (document.implementation.hasFeature('MouseEvents', '2.0')) return e.button
  else
    // IE8 n' -: change total 8 items(IE) to one of three(DOM)
        {
    switch (e.button) {
      case 0:case 1:case 3: case 5: case 7: return 0
      case 2:case 6: return 1
      case 4:return 2
    }
  }
}
gar.getWheelDelta = function (e) {
    // opear9.5-
  if (e.wheelDelta) return client.engine.opera && client.engine.opera < 9.5 ? -e.wheelDelta : e.wheelDelta
    // FF
  else return -e.detail * 40
}

/**
 * getId
 */
function getEl (cssSelector) {
  return document.querySelector(cssSelector)
}
function getEls (cssSelector) {
  return document.querySelectorAll(cssSelector)
}

/**
 * decode queryString
 */
gar.getQueryStringArgs = function () {
    // remove first string '?'
  var qs = location.search.length > 0 ? location.search.substring(1) : '',
        // divide every name-value group
    items = qs.length ? qs.split('&') : [],
    result = {},
    item
  for (var len = items.length; len--;) {
        // devide name-value
    item = items[len - 1].split('=')
        // name:item[0];value=item[1]
    if (decodeURIComponent(item[0]).length)result[decodeURIComponent(item[0])] = decodeURIComponent(item[1])
  }
  return result
}

/**
 * get element's offsetLeft or offsetTop
 */
gar.getEleLeft = function (ele) {
  var actualLeft = ele.offsetLeft,
    cur = ele.offsetParent
    // sum target element's and its all parent's offsetLeft
   /* while(cur!==null){
        actualLeft+=cur.offsetLeft;
        cur=cur.offsetParent;
    } */
  return actualLeft
}

gar.getEleTop = function (ele) {
  var actualTop = ele.offsetTop,
    cur = ele.offsetParent
    /* while(cur!==null){
        actualTop+=cur.offsetTop;
        cur=cur.offsetParent;
    } */
  return actualTop
}

/**
 * get clientWidth n' clientHeight(<html> or <body>)
 */
gar.getViewpoint = function () {
    // version of IE before IE7
    // attribute of document.compatMode is not supported by lower Safari 3.1
  if (document.compatMode == 'BackCompat') {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  } else {
    return {
      width: document.documentElement.Width,
      height: document.documentElement.clientHeight
    }
  }
}

/**
 * get document total height n' width
 */
gar.getDocHeight = function () {
    // IE backCompat: document.body
  return document.compatMode == 'CSS1Compat' ? Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight) : Math.max(document.body.scrollHeight, document.body.clientHeight)
}
gar.getDocWidth = function () {
  return document.compatMode == 'CSS1Compat' ? Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth) : Math.max(document.body.scrollWidth, document.body.clientWidth)
}

/**
 * scroll to top
 */
gar.scrollToTo = function (ele) {
  if (ele.scrollTop != 0)ele.scrollTop = 0
}

/**
 * get element's size
 */
gar.getBoundingClientRect = function (ele) {
  var scrollTop = document.documentElement.scrollTop,
    scrollLeft = document.documentElement.scrollLeft
    // if ele.getBoundingClientRect() is supported
  if (ele.getBoundingClientRect) {
        // when first using this function , we should define 'offset' manually
        // and later,it's not necessary to define it cause 'offset' belongs to this function
    if (typeof arguments.callee.offset !== 'number') {
            // create a temporary element to get 'offset=2' when running in IE8 n' -
      var temp = document.createElement('div')
      temp.style.cssText = 'position:absolute;top:0;left:0;'
      document.body.appendChild(temp)
      arguments.callee.offset = -temp.getBoundingClientRect().top - scrollTop
            // clear
      document.body.removeChild(temp)
      temp = null
    }
    var rect = ele.getBoundingClientRect(),
      offset = arguments.callee.offset
    return {
      left: rect.left + offset,
      right: rect.right + offest,
      top: rect.top + offset,
      bottom: rect.bottom + offset
    }
  } else {
        // generally,offsetWidth=right-left,offsetHeight=bottom-top,left=getEleLeft(),right=getEleTop()
        // -scrollLeft: in case of browser's window was scrolled when calling the function
    var actuallLeft = getEleLeft(ele),
      actuallTop = getEleTop(ele)
    return {
      left: actuallLeft - scrollLeft,
      right: actuallLeft + ele.offsetWidth - scrollLeft,
      top: actuallTop - scrollTop,
      bottom: actuallTop + ele.offsetHeight - scrollTop
    }
  }
}

/**
 * requestAnimationFrame ff4.0+ chrome IE10+,OP
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
                                 window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                                 function (callback) { return window.setTimeout(callback, 1000 / 60) }
}

/**
 * addClass:hide&show
 */
gar.addClass = function (eleOrObj, classname) {
  if (!eleOrObj.nodeType) {
    for (var className in eleOrObj) {
      if (!new RegExp('\\b' + className + '\\b', 'gi').test(eleOrObj[className].className)) { eleOrObj[className].className = eleOrObj[className].className.concat(' ' + className) }
    }
  } else if (!new RegExp('\\b' + classname + '\\b', 'gi').test(eleOrObj.className)) { eleOrObj.className = eleOrObj.className.concat(' ' + classname) }
}
gar.removeClass = function (eleOrObj, classname) {
  if (!eleOrObj.nodeType) {
    for (var className in eleOrObj) {
      if (new RegExp('\\b' + className + '\\b', 'gi').test(eleOrObj[className].className)) { eleOrObj[className].className = ('' + eleOrObj[className].className + '').replace(className, '') }
    }
  } else if (new RegExp('\\b' + classname + '\\b', 'gi').test(eleOrObj.className)) { eleOrObj.className = ('' + eleOrObj.className + '').replace(classname, '') }
}

/**
 * get style
 */
gar.getStyle = function (ele, css, pseudoEleInfo) {
  if (document.defaultView.getComputedStyle) {
    this.getStyle = function (ele, css, pseudoEleInfo) {
      return document.defaultView.getComputedStyle(ele, pseudoEleInfo || null)[css]
    }
  } else if (ele.currentStyle) {
    this.getStyle = function (ele, css) {
      return ele.currentStyle[css]
    }
  }
  return this.getStyle(ele, css, pseudoEleInfo)
}

/**
 * who attribute belongs to?
 */
gar.propertyWhere = function (obj, name) {
  if (obj.hasOwnProperty(name)) return 'instance'
  else if (name in obj && !obj.hasOwnProperty(name)) return 'prototype'
  else return false
}

/**
 * add option into select
 * clear selectbox
 */
gar.addOpt = function (selectbox, optTxt, optVal) {
  selectbox.add(new Option(optTxt, optVal), undefined)
}
gar.clearSelectbox = function (selectbox) {
  for (var i = selectbox.options.lenght; i--;)selectbox.remove(0)
}

/**
 * function throttle:ignore some requests based on time quantum for some cases where function is frequently called which brings about capability being decreased
 * aim to situation like these: 1.resize event 2.mousemove 3.update progress
 */
gar.throttle = function (fn, interval) {
  var _self = fn, timer, firstTime = true
  return function () {
    var args = arguments, _me = this
    if (firstTime) {
      _self.apply(_me, args)
      return firstTime = false
    }
    if (timer) return false
    timer = setTimeout(function () {
      clearTimeout(timer)
      timer = null
      _self.apply(_me, args)
    }, interval || 500)
  }
}

/**
 * time sharing function:in some cases,we need to create thousands of node at a time but browser will suffer huge work leading to degrade performance
 */
gar.timeChunk = function (ary, fn, count, interval) {
  var obj, t, len = ary.length,
    start = function () {
      for (var i = 0; i < Math.min(count || 1, len); i++) {
        obj = ary.shift()
        fn(obj)
      }
    }
  return function () {
    t = setInterval(function () {
      if (ary.length === 0) return clearInterval(t)
      start()
    }, interval)
  }
}

/**
 * currying function: receive some arguments but not calculate at once until this function is really needed
 */
gar.currying = function (fn) {
  var args = []
  return function () {
    if (arguments.length === 0) return fn.apply(this, args)
    else {
      [].push.apply(args, arguments)
      return arguments.callee
    }
  }
}

/**
 * jude object type: String ,Array , or Number
 */
for (var i = 0, type; type = ['String', 'Array', 'Number'][i++];) {
  (function (type) {
    gar['is' + type] = function (obj) {
      return Object.prototype.toString.call(obj) === '[Object' + type + ']'
    }
  })(type)
}

/**
 * localStorage : a version of being compatible to those browsers that only support globalStorage
 */
gar.getLocalStorage = function () {
  if (typeof localStorage === 'object') this.getLocalStorage = function () { return localStorage }
  else if (typeof globalStorage === 'object') this.getLocalStorage = function () { return globalStorage[localhost.host] }
  else throw new Error('Local storage not available!')
  this.getLocalStorage()
}

/**
 * get Full screen width&height
 */
gar.getFullPageWH = function (wOrh) {
  var pageWidth = document.innerWidth, pageHeight = document.innerHeight
  if (typeof pageWidth !== 'number') {
    if (document.compatMode == 'CSS1Compat') {
      pageWidth = document.documentElement.clientWidth
      pageHeight = document.documentElement.clientHeight
    } else {
      pageWidth = document.body.clientWidth
      pageHeight = document.body.clientHeight
    }
  }
  this.getFullPageWH = function (wOrh) {
    if (wOrh == 'w') return pageWidth
    else return pageHeight
  }
  return this.getFullPageWH(wOrh)
}

/**
 * parasitic combination inheritance:
 */
gar.inheritPrototype = function (subType, supType) {
  var _pro = (function (pro) {
    function F () {}
    F.prototype = pro
    return new F()
  })(supType.prototype)
  _pro.constructor = subType
  subType.prototype = _pro
}

/* ===================================================== change native javascript object ============================================================================ */
Function.fn = Function.prototype
/**
 * bind: compatible with old version browser
 */
if (!Function.fn.bind) {
  Function.fn.bind = function (obj) {
    var slice = [].slice,
      args = slice.call(arguments, 1),
      self = this,
      nop = function () {},
      bound = function () {
        return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)))
      }
    nop.prototype = self.prototype
    bound.prototype = new nop()
    return bound
  }
}

/**
 * implement AOP: pick up some unrelated function form core profession logic module and add to which again by the way of dynamically appending
 */
Function.fn.before = function (beforefn) {
  var _self = this
  return function () {
    beforefn.apply(this, arguments)
    return _self.apply(this, arguments)
  }
}
Function.fn.after = function (afterfn) {
  var _self = this
  return function () {
    var ret = _self.apply(this, arguments)
    afterfn.apply(this, arguments)
    return ret
  }
}

/* ===================================================== data structure ============================================================================ */

/**
 * List
 */
gar.List = function () {
  this.listSize = 0
  this.pos = 0
  this.dataStore = []
}

gar.List.prototype = {
  constructor: gar.List,
  append: function (ele) {
    this.dataStore[this.listSize++] = ele
  },
  find: function (ele) {
    for (var l = this.dataStore.length; l--;) {
      if (this.dataStore[l] == ele) { return l }
    }
    return -1
  },
  remove: function (ele) {
    var foundAt = this.find(ele)
    if (foundAt < -1) {
      this.dataStore.splice(foundAt, 1)
      --this.listSize
      return true
    }
    return false
  },
  length: function () {
    return this.listSize
  },
  toString: function () {
    return this.dataStore
  },
  insert: function (ele, after) {
    var insertPos = this.find(after)
    if (insertPos > -1) {
      this.dataStore.splice(insertPos + 1, 0, ele)
      ++this.listSize
      return true
    }
    return false
  },
  clear: function () {
    delete this.dataStore
    this.dataStore = []
    this.listSize = this.pos = 0
  },
  contains: function (ele) {
    for (var l = this.dataStore.length; l--;) {
      if (this.dataStore[l] == ele) { return true }
    }
    return false
  },
  front: function () {
    this.pos = 0
  },
  end: function () {
    this.pos = this.listSize - 1
  },
  prev: function () {
    if (this.pos > 0)--this.pos
  },
  next: function () {
    if (this.pos < this.listSize - 1)++this.pos
  },
  currPos: function () {
    return this.pos
  },
  moveTo: function (pos) {
    this.pos = pos
  },
  getEle: function () {
    return this.dataStore[this.pos]
  }
}

/**
 * Stack
 */
gar.Stack = function () {
  this.dataStore = []
  this.top = 0
}
gar.Stack.prototype = {
  constructor: gar.Stack,
  push: function (ele) {
    this.dataStore[this.top++] = ele
  },
  pop: function () {
    return this.dataStore[--this.top]
  },
  peek: function () {
    return this.dataStore[this.top - 1]
  },
  length: function () {
    return this.top
  },
  clear: function () {
    this.top = 0
  }
}

/**
 * Queue:
 */
gar.Queue = function () {
  this.dataStore = []
}
gar.Queue.prototype = {
  constructor: gar.Queue,
  enqueue: function (ele) {
    this.dataStore.push(ele)
  },
  dequeue: function () {
    return this.dataStore.shift()
  },
  front: function () {
    return this.dataStore[0]
  },
  back: function () {
    return this.dataStore[this.dataStore.length - 1]
  },
  toString: function () {
    var retStr = ''
    for (var i = 0, l = this.dataStore.length; i < l; i++)retStr += this.dataStore[i] + '\n'
    return retStr
  },
  empty: function () {
    if (this.dataStore.length === 0) return true
    return false
  },
  count: function () {
    return this.dataStore.length
  }
}

/*
 * LinkedList：
 */
// LList
gar.SingleNode = function (ele) {
  this.ele = ele
  this.next = null
}
gar.LList = function () {
  this.head = new gar.SingleNode('head')
}
gar.LList.prototype = {
  constructor: gar.LList,
  find: function (item) {
    var curN = this.head
    while (curN.ele != item)curN = curN.next
    return curN
  },
  insert: function (newEle, item) {
    var newN = new gar.SingleNode(newEle),
      cur = this.find('item')
    newN.next = cur.next
    cur.next = newN
  },
  display: function (fn) {
    var curN = this.head
    while (!(curN.next == null)) {
      fn(curN.next.ele)
      curN = curN.next
    }
  },
  findPrev: function (item) {
    var curN = this.head
    while (!(curN.next == null) && (curN.next.ele != item))curN = curN.next
    return curN
  },
  remove: function (item) {
    var prevN = this.findPrev(item)
    if (!(prevN.next == null)) {
      prevN.next = prevN.next.next
      item.next = null
    }
  }
}

// loopList:
gar.loopList = function () {
  gar.LList.call(this)
  this.head.next = this.head
}

gar.loopList.prototype = new gar.LList()
var garLL$$ = gar.loopList
garLL$$.fn = gar.loopList.prototype
garLL$$.fn.constructor = gar.loopList

garLL$$.fn.display = function (fn) {
  var curN = this.head
  while (!(curN.next == null) && !(curN.next.ele == 'head')) {
    fn(curN.next.ele)
    curN = curN.next
  }
}

// DbList:
gar.DbNode = function (ele) {
  this.ele = ele
  this.prev = null
  this.next = null
}
gar.DbLList = function () {
  this.head = new gar.DbNode('head')
}
gar.DbLList.prototype = {
  constructor: gar.DbNode,
  find: function (item) {
    var curN = this.head
    while (curN.ele != item)curN = curN.next
    return curN
  },
  display: function (fn) {
    var curN = this.head
    while (!(curN.next == null)) {
      fn(curN.next.ele)
      curN = curN.next
    }
  },
  insert: function (newEle, item) {
    var newN = new DbNode(newEle),
      cur = this.find(item)
    newN.next = cur.next
    newN.prev = cur
    cur.next.prev = newN
    cur.next = newN
  },
  remove: function (item) {
    var curN = this.find(item)
    if (!(curN.next == null)) {
      curN.next.prev = curN.prev
      curN.prev.next = curN.next
      curN.prev = curN.next = null
    }
  },
  findLast: function () {
    var curN = this.head
    while (!(curN.next == null))curN = curN.next
    return curN
  },
  dispReverse: function (fn) {
    var lastN = this.findLast
    while (!(curN.prev == null)) {
      fn(curN)
      curN = curN.prev
    }
  }
}

/**
 * Dictionary:
 */
gar.Dictionary = function () {
  this.dataStore = new Array()
}
gar.Dictionary.prototype = {
  constructor: gar.Dictionary,
  add: function (key, val) {
    this.dataStore[key] = val
  },
  find: function (key) {
    return this.dataStore[key]
  },
  remove: function (key) {
    delete this.dataStore[key]
  },
  showAll: function (fn) {
    for (var key in Object.keys(this.dataStore).sort())fn(key, this.dataStore[key])
  },
  count: function () {
    var n = 0
    for (var key in Object.keys(this.dataStore))++n
    return n
  },
  clear: function () {
    for (var key in Object.keys(this.dataStore)) delete this.dataStore[key]
  }
}

/**
 * HashTable:
 */
gar.HashTable = function (arrLen) {
  this.table = new Array(arrLen)
}
gar.HashTable.prototype = {
  constructor: gar.HashTable,
    // data instanceof String
  HornerHash: function (str) {
    for (var H = 37, total = 0, l = str.length; l--;)total += H * total + str.charCodeAt(l)
    total %= this.table.length
    if (total < 0)total += this.table.length - 1
    return parseInt(total)
  },
    // data instanceof Integer
  setIntKeyData: function (arr, nLength, min, max) {
    for (var l = arr.length, num = ''; l--;) {
      for (var i = nLength; i--;)num += Math.random() * nLength >>> 0
      num += min + Math.random() * (max - min + 1) | 0
      arr[l] = num
    }
  }
}

// chain address method
gar.chainAddr = function (arrLen) {
  gar.HashTable.call(this, arrLen)
  for (var l = arrLen; l--;) this.table[l] = new Array()
}

gar.inheritPrototype(gar.chainAddr, gar.HashTable)
var garCA$$ = gar.chainAddr
garCA$$.fn = gar.chainAddr.prototype

garCA$$.fn.put = function (key, data) {
  var pos = this.HornerHash(key), index = 0, t = this.table
  while (t[pos][index] != undefined)index += 2
  t[pos][index] = key
  t[pos][index + 1] = data
}
garCA$$.fn.get = function (key) {
  var index = 0, pos = this.HornerHash(key), t = this.table
  while (t[pos][index] != key) {
    index += 2
    if (t[pos][index] === undefined) return undefined
  }
  return t[pos][index]
}

// linear probing method:
gar.lineProb = function (arrL) {
  gar.HashTable.call(this, arrL)
  this.vals = []
}

gar.inheritPrototype(gar.lineProb, gar.HashTable)
var garLP$$ = gar.lineProb
garLP$$.fn = garLP$$.prototype

garLP$$.fn.put = function (key, data) {
  var pos = this.HornerHash(key), t = this.table, v = this.vals
  if (t[pos] === undefined) {
    t[pos] = key
    v[pos] = data
  } else {
    while (t[pos] != undefined)++pos
    t[pos] = key
    v[pos] = data
  }
}
garLP$$.fn.get = function (key) {
  var hash = -1
  hash = this.HornerHash(key)
  if (hash > -1) {
    for (var i = hash; this.table[hash] != undefined; i++) {
      if (this.table[hash] === key) { return this.vals[hash] }
    }
  }
  return undefined
}
