import $ from '../../lib/$'
import compileUtil from './compileUtil'

// === Compile: 指令解析器, 对每个元素节点的指令进行扫描和解析，根据指令模板替换数据, 以及绑定相应的更新函数 === //
/*
                                          渲染视图
                                      --> Updater
                                     /         ^
                               初始化/          |
                解析指令            /           |
new Compile() ----------> 模板指令替换成对应数据  | 数据变化, 通知更新视图
                                  \            |
                            编译指令\           |
                                    \          |
                                     --> new Updater() 监听数据，绑定更新函数

*/

// === 常用nodeType: === //
// === 1 - Element === //
// === 3 - Text === //
// === 9 - Document === //
// === 11 - DocumentFragment === //

/**
 * 判断是否为指令
 * @param {String} attr - 属性
 * @return {Boolean}
 * @private
 */
const isDirective = attr => attr.indexOf('v-') === 0

/**
 * 判断是否为事件指令
 * @param {String} dir - v-后面的字符
 * @return {Boolean}
 * @private
 */
const isEventDirective = dir => dir.indexOf('on') === 0

/**
 * 判断是否为元素类型
 * @param {Node} node - 节点
 * @return {Boolean}
 * @private
 */
const isElementNode = node => node.nodeType === 1

/**
 * 判断是否为文本类型
 * @param {Node} node - 节点
 * @return {Boolean}
 * @private
 */
const isTextNode = node => node.nodeType === 3

/**
 * 编译类
 */
export default class Compile {
  
  constructor (el = document.body, vm) {
    
    this.$vm = vm
    this.$el = isElementNode(el) ? el : $(el)

    // 初始化
    this.init()
    
  }

  /**
   * 因为遍历解析的过程有多次操作dom节点，为提高性能和效率，会先将跟节点el转换成文档碎片fragment进行解析编译操作，解析完成，再将fragment添加回原来的真实dom节点中
   */
  init () {

    let $el = this.$el

    if (!$el) {
      return
    }

    this.$fragement = this.node2Fragment($el)

    this.compile(this.$fragement)

    $el.appendChild(this.$fragement)

  }
  
  /**
   * 转换成fragment
   * @param {Node} el - 节点
   * @return {DocumentFragment}
   */
  node2Fragment (el) {
    
    let frag = document.createDocumentFragment()
    let child

    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      frag.appendChild(child)
    }

    return frag
    
  }

  /**
   * compileElement方法将遍历所有节点及其子节点，进行扫描解析编译，调用对应的指令渲染函数进行数据渲染，并调用对应的指令更新函数进行绑定
   * @param {Node} node - 节点
   */
  compile (node) {
    
    [...node.childNodes].forEach(node => {
      
      let text = node.textContent
      // 表达式文本
      let reg = /\{\{(.*?)\}\}/

      // 编译元素节点
      if (isElementNode(node)) {

        this.compileAttr(node)

      // 编译文本节点
      } else if (isTextNode(node) && reg.test(text)) {

        this.compileText(node, RegExp.$1)

      }

      // 递归遍历编译子节点
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
      
    })
    
  }


  /**
   * 编译特性
   * @param {Node} node - 节点
   */
  compileAttr (node) {

    [].slice.call(node.attributes).forEach(attr => {

      const attrName = attr.name

      // 若不是v-开头的特性则返回
      if (!isDirective(attrName)) {
        return
      }

      const attrVal = attr.value
      // v- 后面的部分
      const dir = attrName.substring(2)

      // 事件指令, 如 v-on:click
      if (isEventDirective(dir)) {

        compileUtil.eventHandler(node, this.$vm, attrVal, dir)

      // 普通指令
      } else {

        compileUtil[dir] && compileUtil[dir](node, this.$vm, attrVal)

      }

      // 把自定义特性移除掉
      node.removeAttribute(attrName)

    })

  }

  /**
   * 编译文本
   * @param {Node} node - 节点
   * @param {String} exp - 值
   */
  compileText (node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

}
