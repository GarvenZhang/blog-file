/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))

}

// === 函数组合: 将多个函数进行组合成一个函数 === //
// === 1 redux中 compose(): 利用 数组的 reduce() 方法, 将数组中的函数一个个从右往左执行, 最有的函数执行完后返回的值 作为参数 传给第二右的函数, 依次类推, compose函数就像一条管道, 将传入的参数 依次经过 从右往左 的每个函数处理, 最后返回  === //

const a = arg => arg + 'a'
const b = arg => arg + 'b'
const c = arg => arg + 'c'

const fn = compose(a, b, c)
const ret = fn('fn-')

console.log(ret)

// 发生的实质

const funs = [a, b, c]

compose(funs) {
  return funs.reduce((accumulator, currentValue) => (...args) => accumulator(currentValue(...args)))
}

compose(funs) {
  return funs.reduce(function (accumulator, currentValue) {
    return function (...args) {
      return accumulator(currentValue(...args))
    }
  })
}

fn = funs.reduce(function (accumulator, currentValue) {

  return function (...args) {
    return accumulator(currentValue(...args))
  }

})

ret = (function (...args) {
  return a(b[...args])
})(c('fn-'))

ret = function ('fn-c') {
  return a(b('fn-c'))
}

ret = function ('fn-c') {
  return a('fn-cb')
}

ret = function ('fn-c') {
  return 'fn-cba'
}

ret = 'fn-cba'