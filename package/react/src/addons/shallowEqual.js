// === 浅比较: 先比较基本类型, 再比较引用类型的第一层 === //

const hasOwn = Object.prototype.hasOwnProperty

/**
 * 比较基本类型
 * // === 1 ==: js中的 == 操作符 会自动将 0, '', null, undefined 转为 false === //
 * // === 2 ===: 全等操作符不进行类型转换, 但有两种疏忽情况: === //
 * +0 === -0 // true
 * NaN === NaN // false
 * // === 3 无法判断: {a: 1} === {a: 1} === //
 */
function is(x, y) {

  if (x === y) {

    // 若 x, y 都为 0, 则 1 / 0 = 1 / 0 = Infinity
    // 若 x, y 分别为+0, -0, 则 1/(+0) = Infinity, 1 / (-0) = -Infinity
    // 其它基本类型, 都返回true
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {

    // NaN !== NaN // true
    return x !== x && y !== y
  }
}

export default function shallowEqual(objA, objB) {

  // 比较基本类型
  if (is(objA, objB)) return true

  // 若不是object类型可直接返回false, 表示没有误判的情况
  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false
  }

  // 判断对象

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  // 先判断key长度
  if (keysA.length !== keysB.length) return false

  // key长度相等, 则循环比较第一层的key值
  for (let i = 0; i < keysA.length; i++) {

    // 先判断 ObjB 里面有没有 objA 的key值, 若有, 再进行基本类型的比较
    if (!hasOwn.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}