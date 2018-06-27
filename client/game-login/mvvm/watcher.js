import Event from './event'

// === Watcher: 作为连接Observer和Compile的桥梁, 订阅并收到每个属性变动的通知, 执行指令绑定的相应回调, 从而更新视图 === //
// === 1 实现: === //
// === 1.1 在自身实例化时往属性订阅器(event)里面添加自己 === //
// === 1.2 自身必须有一个update()方法 === //
// === 1.3 待属性变动event.trigger()通知时，能调用自身的update()方法，并触发Compile中绑定的回调 === //
// === 2 思路: 实例化Watcher的时候，调用get()方法，通过Event.target = watcherInstance 标记订阅者是当前watcher实例，强行触发属性定义的getter方法，getter方法执行的时候，就会在属性的订阅器event添加当前watcher实例，从而在属性值有变化的时候，watcherInstance就能收到更新通知。 === //

/**
 * 解析getter
 * 有可能是 'outer.middle.inner' 这样通过多层访问的属性，因此需要解析
 * 本质上只是为了能访问到model中属性，触发其get
 * @param {String} exp - model中的属性名
 */
function parseGetter (exp) {

  if (/[^\w.$]/.test(exp)) {
    return
  }

  const exps = exp.split('.')

  return obj => {

    for (let i = 0, l = exps.length; i < l; ++i) {

      if (!obj) {
        return
      }

      obj = obj[exps[i]]

    }

    return obj

  }

}

export default class Watcher {

  constructor (vm, expOrFn, cb) {

    this.cb = cb
    this.vm = vm
    this.eventIds = {}

    this.getter = typeof expOrFn === 'function' ? expOrFn : parseGetter(expOrFn)

    // 此处为了触发属性的getter，从而在event添加自己，结合Observer更易理解
    this.val = this.get()

  }

  /**
   * 属性值变化收到通知
   */
  update () {

    // 取到最新值
    const newVal = this.get()
    const oldVal = this.val

    if (newVal === oldVal) {
      return
    }

    // 更新值
    this.val = newVal
    // 执行Compile中绑定的回调，更新视图
    this.cb.call(this.vm, newVal, oldVal)

  }

  /**
   * 添加自定义事件
   * @param {Object} event - 自定义事件
   */
  addEvent (event) {

    if (this.eventIds.hasOwnProperty(event.id)) {
      return
    }

    event.listen(this)
    this.eventIds[event.id] = event

  }

  /**
   * 触发 observer.js 中定义的get
   * @return {String}
   */
  get () {

    // 将当前订阅者指向自己
    Event.target = this

    // 这里会触发属性的getter，从而添加订阅者
    // 触发getter，添加自己到属性订阅器中
    const val = this.getter.call(this.vm, this.vm)

    // 添加完毕，重置
    Event.target = null

    return val

  }

}