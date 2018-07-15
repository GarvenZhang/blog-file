Function.prototype.before = function (beforeFn) {
  let self = this

  return function () {
    beforeFn.apply(this, arguments)
    return self.apply(this, arguments)
  }
}

Function.prototype.after = function (afterFn) {
  let self = this

  return function () {
    let ret = self.apply(this, arguments)
    afterFn.apply(this, arguments)

    return ret
  }
}
