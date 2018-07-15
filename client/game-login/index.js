import MVVM from './mvvm'
import Validator from '../lib/validator'

/**
 * 跨域: iframe + window.name
 */
const data = window.name && JSON.parse(window.name)

// === Vue 基础： === //
// === 0 实例: 每个 Vue 应用都是通过用 Vue 函数创建一个新的 Vue 实例开始的 === //
// === 0.1 data: 只有当实例被创建时 data 中存在的属性才是响应式的 === //
// === 0.2 实例属性/方法: 有前缀 $，以便与用户定义的属性区分开来 === //
// === 1 插值: === //
// === 1.1 {{text}}: 文本插值 === //
// === 1.2 v-html: 输出html === //
// === 1.3 v-bind: 绑定html特性 === //
// === 2 指令: 带有 v- 前缀的特殊特性 === //
// === 3 计算属性: 对于任何复杂的逻辑都应使用计算属性, 是基于他们的依赖进行缓存的，只有在它的相关依赖发生改变时才会重新求值 === //
// === 3.1 实现: 在 computed 属性中声明有返回值的函数 === //
// === 3.2 getter与setter: === //
// === 3.2.a 默认只有getter，即声明的函数就是getter === //
// === 3.2.b 需要setter时刻显示声明: get: function () {}, set: function () {} === //
// === 4 方法: 在触发重新渲染时都会执行 === //
// === 4.1 实现: 在 methods 属性中声明带有返回值的函数 === //
// === 5 监听属性: 更通用的方式来观察和响应Vue实例上的数据变动 === //
// === 4.1 实现: 在 watch 属性上声明函数 === //

let vm = new MVVM({
  el: '#mvvm-app',
  data: {
    msgs: '',
    email: '',
    name: '',
    isRemembered: false
  },
  methods: {
    submit: function (e) {
      let validator = new Validator()

      validator.add(this.email, [
        {
          strategy: 'isEmpty',
          errMsg: '邮箱不能为空!'
        }, {
          strategy: 'isMail',
          errMsg: 'email格式不合法'
        }
      ])

      validator.add(this.name, [
        {
          strategy: 'isEmpty',
          errMsg: '不能为空!'
        }, {
          strategy: 'isLegal',
          errMsg: '昵称不合法'
        }
      ])

      const ret = validator.start()
      console.log(ret)
      if (ret) {
        alert(ret)
        return false
      }
    }
  }
})

vm.$watch('name', function () {

})
