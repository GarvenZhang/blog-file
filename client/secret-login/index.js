import '../lib/aop'
import { $ } from '../lib/$'
import './index.css'

// === XDM(跨文档消息传送cross-document messaging): 在来自不同域的页面间传递消息 === //
// === 1 window.postMessage(消息, 表示消息接收方来自哪个域的字符串) === //
// === 2 message事件: 接收到XDM消息时，会触发window对象的message事件 === //
// === 2.1 e.data, e.origin(发送消息的文档所在的域), source(发送消息的文档的window对象的代理) === //

var data = {}

window.addEventListener('message', function (e) {
  if (e.origin === 'http://localhost:8080') {
    Object.assign(data, e.data)

    e.source.postMessage({
      retCode: 1,
      msg: '修改成功!'
    }, data.parentSrc)
  }

}, false)

// === 装饰器模式: 能在不改变对象自身的基础上, 在程序运行期间给对象动态地添加职责的方式 === //
// === 1 与代理模式的区别: 代理模式强调一种关系（Proxy 与它的实体之间的关系），这种关系可以静态的表达，也就是说，这种关系在一开始就可以被确定。而装饰者模式用于一开始不能确 定对象的全部功能时。代理模式通常只有一层代理-本体的引用，而装饰者模式经常会形成一条长长的装饰链 === //
// === 2 例子: 插件式表单验证 === //
// === 2.1 解析: 校验输入和提交表单的代码完全分离开来，它们不再有任何耦合关系，formSubmit = formSubmit.before( validata )这句代码，如同把校验规则动态接在formSubmit函数 之前，validata成为一个即插即用的函数，它甚至可以被写成配置文件的形式，这有利于我们分开维护这两个函数 === //

const $btnSubmit = $('.btn-submit')

// 验证
const validate = () => {
  
  
}

let formSubmit = () => {
 
  
  
}

formSubmit = formSubmit.before(validate)

$btnSubmit.onclick = formSubmit()
