// === Observer: 数据监听器，对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者 === //
// === 1 实现: === //
// === 1.1 将需要observe的数据对象进行递归遍历, 包括子属性对象的属性, 都加上getter和setter, 这样在给某个属性赋值时就会触发setter, 就能监听到数据变化了 === //

// === Object.defineProperty(对象, 属性名, 描述对象): === //
// === enumerable: 默认true, 是否可枚举(如for-in, Object.keys) === //
// === writable: 默认true, 是否可修改值 === //
// === configurable: 默认true, 是否可配置(任何尝试删除目标属性或修改属性以下特性（writable, configurable, enumerable）的行为将被无效化) === //
// === value: 默认undefined, 属性的值 === //
// === set: 默认undifined, 设置值时调用 === //
// === get: 默认undifined, 访问值时调用 === //

import Event from './event'

class Observer {
  constructor (data) {
    this.data = data
    this.walk(data)
  }

  /**
   * 遍历数据对象，设置数据劫持
   * @param {Object} data - 数据对象
   */
  walk (data) {
    Object.keys(data).forEach(key => this.defineReactive(this.data, key, data[key]))
  }

  /**
   * 核心: 数据劫持
   * @param {Object} data - 数据对象
   * @param {String} key - 属性
   * @param {*} val - 值
   */
  defineReactive (data, key, val) {
    let event = new Event()

    // 递归，监听子属性, 确保每个基本类型的属性能被监听到
    observe(val)

    // 进行数据劫持
    Object.defineProperty(data, key, {

      enumerable: true,
      configurable: false,

      get () {
        // 由于需要在闭包内添加watcher，所以通过Event定义一个全局target属性，暂存watcher, 添加完移除
        Event.target && event.depend()

        return val
      },

      set (newVal) {
        if (newVal === val) {
          return
        }

        val = newVal

        // 若是对象, 监听新值
        observe(newVal)

        // 发布给所有订阅者
        event.trigger()
      }
    })
  }
}

/**
 * 观察
 * @param {Object} data - 数据对象
 * @return {Object} - 观察者实例
 */
const observe = data => (!data || typeof data !== 'object') ? '' : new Observer(data)

export default observe
