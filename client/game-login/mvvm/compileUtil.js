import Watcher from './watcher'
import updater from './updater'

/**
 * 监听数据、绑定更新函数的处理
 * @param {Node} node - 节点
 * @param {Object} vm - viewModel对象
 * @param {String} attrVal - 属性值
 * @param {String} dir - 指令
 * @private
 */
function bind (node, vm, attrVal, dir) {

  // 视图更新函数
  const updaterFn = updater[dir + 'Updater']

  // 第一次初始化视图
  // 将new MVVM时的data中的数据反映到视图中
  updaterFn && updaterFn(node, _getVMVal(vm, attrVal))

  // 通过new Watcher()添加回调来接收数据变化的通知
  // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
  // 一旦属性值有变化，会收到通知执行此更新函数，更新视图
  new Watcher(vm, attrVal, (newVal, oldVal) => updaterFn && updaterFn(node, newVal, oldVal))

}

// === 解析多层级变量访问: === //
// === 1 思路: 通过split('.')来划分每一个层级的属性, 然后通过forEach来访问每一个层级，每访问一个层级就改变变量的引用 === //
// === 2 例子: let target = outer.middle.inner  === //
/*
let ret = outer
target = target.split('.')
target.forEach(item => ret = ret[item])
return ret
*/

/**
 * 访问viemModel中的val值
 * @param {Object} vm - viewModel
 * @param {String} attrVal - 属性值
 * @private
 */
function _getVMVal (vm, attrVal) {

  let val = vm

  attrVal = attrVal.split('.')
  attrVal.forEach(item => val = val[item])

  return val

}

/**
 * 设置viewModel值
 * @param {Object} vm - viewModel
 * @param {String} attrVal - 属性值
 * @param {String} newVal - 新值
 * @private
 */
function _setVMVal (vm, attrVal, newVal) {

  let _val = vm

  attrVal = attrVal.split('.')
  attrVal.forEach((item, i) => {

    // 还未到达最深层次的属性时就改变引用并保存，到最后一层次属性时将其值改变为新值
    if (i < attrVal.length - 1) {
      _val = _val[item]
    } else {
      _val[item] = newVal
    }

  })

}

// 指令处理集合
export default {

  /**
   * 处理v-text指令
   * @param {Node} node - 节点
   * @param {Object} vm - viewModel对象
   * @param {String} attrVal - 属性值
   */
  text (node, vm, attrVal) {
    bind(node, vm, attrVal, 'text')
  },

  /**
   * 处理v-html指令
   * @param {Node} node - 节点
   * @param {Object} vm - viewModel对象
   * @param {String} attrVal - 属性值
   */
  html (node, vm, attrVal) {
    bind(node, vm, attrVal, 'html')
  },

  /**
   * 处理v-model指令
   * @param {Node} node - 节点
   * @param {Object} vm - viewModel对象
   * @param {String} attrVal - 属性值
   */
  model (node, vm, attrVal) {

    bind(node, vm, attrVal, 'model')

    let val = _getVMVal(vm, attrVal)

    node.addEventListener('input', e => {

      const newVal = e.target.value

      if (val === newVal) {
        return
      }

      _setVMVal(vm, attrVal, newVal)

      val = newVal

    })

  },

  /**
   * 处理v-class指令
   * @param {Node} node - 节点
   * @param {Object} vm - viewModel对象
   * @param {String} attrVal - 属性值
   */
  class (node, vm, attrVal) {
    bind(node, vm, attrVal, 'class')
  },

  /**
   * 处理 v-on:xxx 指令
   * @param {Node} node - 节点
   * @param {Object} vm - viewModel
   * @param {String} attrVal - 属性值
   * @param {String} dir - 指令
   */
  eventHandler (node, vm, attrVal, dir) {

    // 从v-特性中获取到事件名
    const eventType = dir.split(':')[1]
    // 从methods中获取到事件处理程序
    const fn = vm.ops.methods && vm.ops.methods[attrVal]

    // 绑定
    eventType && fn && node.addEventListener(eventType, fn.bind(vm), false)

  },

}
