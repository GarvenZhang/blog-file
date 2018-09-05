import ActionTypes from './utils/actionTypes'

/**
 * 判断是否由对象字面量或new Object()声明的对象
 * // === 思路: 根据原型链, 如果是'object'类型, 原型链终点肯定是null, 第二个肯定是Object, 而其他的Function/Array都是继承与Object的, 所以只需判断 对象的原型 与 它的原型链上null的子类 的地址是否相等即可 === //
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

/**
 * 检查传入reducer的state是否合法
 */
function assertReducerShape(reducers) {

  // 遍历全部reducer
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]

    // 当第一个参数传入undefined时，则为各个reducer定义的默认参数
    // ActionTypes.INIT几乎不会被定义，所以会通过switch的default返回reducer的默认参数。如果没有指定默认参数，则返回undefined，抛出错误
    const initialState = reducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === 'undefined') {
      throw new Error(
       '...'
      )
    }

  })
}


export default function combineReducers(reducers) {

  // 筛选掉reducers中不是function的键值对
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache

  // 判断reducer中传入的值是否合法
  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  /*

  // create store
  export function configureStore (initialStore = {}) {
    return createStore(
      rootReducer,
      initialStore,
      storeEnhancers
    )
  }

  // combineReducer调用
  import { combineReducers } from 'redux'
  import { latestReducer, bestReducer, searchReducer, allReducer } from './ArticleList'
  import { reducer as ArticleCategoryReducer } from './ArticleCategory'
  import { reducer as ArticleReducer } from './Article'
  import { reducer as ArticleLinkListReducer } from './ArticleLinkList'
  import { reducer as UserReducer } from './User'
  import { reducer as PopupReducer } from './Popup'
  import { reducer as IframeReducer } from './Iframe'
  import { reducer as AddressReducer } from './Adress'

  export default combineReducers({
    searchReducer,
    latestReducer,
    bestReducer,
    allReducer,
    ArticleCategoryReducer,
    ArticleReducer,
    ArticleLinkListReducer,
    UserReducer,
    PopupReducer,
    IframeReducer,
    AddressReducer
  })

  // 某个reducer声明
  export function reducer (state = initialState, action) {

    switch (action.type) {

      case actionTypes.UPDATE_TIPSTYPE:
        return {
          ...state,
          tipsType: action
        }
      default:
        return state

    }

  }

  */

  // 返回一个function。该方法接收state和action作为参数
  return function combination(state = {}, action) {

    // 如果之前的判断reducers中有不法值，则抛出错误
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    let hasChanged = false
    const nextState = {}

    // 遍历所有的key和reducer，分别将reducer对应的key所代表的state，代入到reducer中进行函数调用
    for (let i = 0; i < finalReducerKeys.length; i++) {

      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]

      // 要求传入的Object参数中，reducer function的名称和要和state同名的原因
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)

      // 将reducer返回的值填入nextState
      nextState[key] = nextStateForKey

      // 如果任一state有更新则hasChanged为true
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }

    // 有更新则返回计算后的新state, 不然则返回原来的
    return hasChanged ? nextState : state
  }
}
