// === 数据劫持: 通过Object.defineProperty()来劫持各个属性的setter, getter, 在数据变化时发布消息给订阅者, 触发相应的监听回调 === //
// === 1 流程图: === //
/*
               劫持监听所有属性     通知变化
            ---> Observer ------------------> Event
           /                                    ^ \
          /                                      \ \
new MVVM()                              添加订阅者 \ \ 通知变化
          \                                        \ \
           \               订阅数据变化, 绑定更新函数  \ v
            ---> Compile -------------------------> Watcher
                 解析指令 \                           /
                          \                         /
                        初始化视图                   /
                            \                      /
                             v                    /
                             Updater <------------
*/

// === 自己会如何实现框架的效果？ === //
// === 1 主要步骤: === //
// === 1.1 当填写表单的时候，表单中的值变了，即视图变了，那么模型中对应的数据也应该变 === //
// === 1.2 表单的值变化后，其它与此数据相关的视图也应该有所改变，因此需要模型中数据改变时去通知他们 === //
// === 1.3 这就是实际上的MVVM: 数据变化 -> 视图更新; 视图交互变化 -> 数据model变更的双向绑定 === //
// === 2 核心要点: === //
// === 2.1 一开始会在html上绑定指令，比如 v-model ,这个表单就会展现模型中对应的数据, 那么就需要解析指令, 因此需要一个指令解析器 Compiler === //
// === 2.2 绑定了指令的表单字段变化后，模型中的数据也会变化，则需要 change/input 这些事件来通知数据去变化 === //
// === 2.3 数据变化后其他视图也会有所更新, 则需要在模型中的数据变化后, 立即通知其他相应的视图更新，那么就需要把 模型中的数据 和 绑定了指令的表单字段 对应起来 === //
// === 3 实现: === //
// === 3.1 MVVM: 作为数据绑定的入口, 整合Observer、Compiler、Watcher三者 === //
// === 3.2 通过Observer来监听自己的model数据变化 === //
// === 3.3 通过Compile来解析编译模板指令 === //
// === 3.4 利用Warcher搭起Observer和Compile之间的通信桥梁 === //

import Watcher from './watcher'
import observe from './observer'
import Compile from './compile'

/**
 * 属性代理 - 直接通过vnm来访问vm._data
 * @param {String} key - 属性
 * @private
 */
function _proxyData (key) {

  Object.defineProperty(this, key, {

    configurable: false,
    enumerable: false,

    get () {
      return this._data[key]
    },
    set (newVal) {
      this._data[key] = newVal
    }
  })

}

/**
 * 初始化computed
 * 直接通过vm来访问vm.computed上的属性
 * @private
 */
function _proxyComputed () {

  let computed = this.ops.computed

  if (typeof computed !== 'object') {
    return
  }

  Object.keys(computed).forEach(key => {
    Object.defineProperty(this, key, {

      // 若是函数则直接访问，若不是则调用其get
      get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
      set () {}

    })
  })

}

/**
 * MVVM类
 */
export default class MVVM {

  constructor (ops = {}) {

    this.ops = ops
    this._data = ops.data

    // data属性代理
    Object.keys(this._data).forEach(key => _proxyData.call(this, key))

    // computed属性代理
    _proxyComputed.call(this)

    // 数据监听
    observe(this._data)

    // 编译指令
    this.$compile()

  }

  /**
   * 编译指令
   * @return {Object} - Compile实例
   */
  $compile () {
    return new Compile(this.ops.el, this)
  }

  /**
   * 观察
   * @return {Object} - Watcher实例
   */
  $watch (key, cb) {
    return new Watcher(this, key, cb)
  }

}
