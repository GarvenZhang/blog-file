'use strict'

module.exports = compose

// === Middleware: === //
/*

class Application {

  use (fn) {
    this.middleware.push(fn)
    return this
  }

  handleRequest (ctx, fnMiddleware) {

    // 组合中间件
    const fn = compose(this.middleware)

    // code...

    // 处理完中间件后就响应请求
    return fn(ctx).then(handleResponse)
  }

}

app.use(async function (ctx, next) {

  // code...
  await next()

})

*/
// === 1 过程: === //
// === 1.1 一开始通过 app.use 添加async函数, 有形参ctx 和 next, 函数内部会等待 next()执行 === //
// === 1.2 当一个请求来的时候, 会先通过调用 compose 返回 function (context, next) {...} 给fn, 然后fn(ctx) === //
// === 1.3 此时执行到 return dispatch(0)时就会执行 dispatch === //
// === 1.4 当未执行完所有middlewares时, 会一直调用 fn(context, function next () { return dispatch(i + 1)} === //
// === 1.5 即调用 async function (ctx, next) { await next() } 这部分, 当执行到 await next() 时, 实质上是执行的 return dispatch(i + 1), 即下一个中间件 === //
// === 1.6 等执行到最后一个中间件时, fn = middlewares[middlewares.length] = undifined, 则执行 if(!fn) {return Promise.resolve()} === //
// === 1.7 开始从倒数第一个中间件把 await next() 之后的部分执行完毕, 再到倒数第二个, 以此类推 === //

function compose (middleware) {

  return function (context, next) {

    let index = -1
    return dispatch(0)

    function dispatch (i) {

      index = i

      let fn = middleware[i]

      if (i === middleware.length) {
        fn = next
      }

      if (!fn) {
        return Promise.resolve()
      }

      return Promise.resolve(fn(context, function next () {
        return dispatch(i + 1)
      }))

    }
  }
}
