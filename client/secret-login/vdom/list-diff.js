
/**
 * 获取唯一标志符
 * @param {Object} item - 虚拟DOM对象
 * @param {String|Function} key - 标志
 * @private
 * @return {String|Number|undefined}
 */
function _getItemKey (item, key) {

  if (!item || !key) {
    return void 666
  }

  return typeof key === 'string' ? item[key] : key(item)
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 * @return {Object} - {keyIndex: <Object>}
 *                  - 如: {1: 0, 2: 1, 3: 2}
 *                  - {free: <Array>}
 *                  - 如：[VElement{...}, VElement{...}, 'hello world']
 */
function _makeKeyIndexAndFree (list, key) {

  let keyIndex = {}
  let free = []

  for (let i = 0, len = list.length; i < len; ++i) {

    const item = list[i]
    const itemKey = _getItemKey(item, key)

    // key值：在list中的索引
    // 直接把子虚拟DON对象放到free中
    itemKey ? keyIndex[itemKey] = i : free.push(item)

  }

  return {
    keyIndex,
    free
  }
}

/**
 * 替换节点
 * @param {Number} index - 索引
 */
const _remove = (moves, index) => moves.push({index: index, type: 0})

/**
 * 增加
 * @param {Number} index - 索引
 * @param {Object} item - 虚拟DOM对象
 */
const _insert = (moves, index, item) => moves.push({index: index, item: item, type: 1})

/**
 * 从模拟列表中移除
 * @param {Number} index - 索引
 */
const _removeSimulate = (simulateList, index) => simulateList.splice(index, 1)

/**
 * Diff two list in O(N).
 * "list-diff2": "^0.1.4"
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 *                  - {children: <Array>}
 *                  - 子节点
 */
export default function (oldList, newList, key) {

  let oldMap = _makeKeyIndexAndFree(oldList, key)
  let newMap = _makeKeyIndexAndFree(newList, key)
  let newFree = newMap.free

  let oldKeyIndex = oldMap.keyIndex
  let newKeyIndex = newMap.keyIndex

  let moves = []

  // a simulate list to manipulate
  let children = []
  let i = 0
  let item
  let itemKey
  let freeIndex = 0

  // 看看是否在新的虚拟DOM中移除了某些元素，移除了的用null做标记
  while (i < oldList.length) {

    item = oldList[i]
    itemKey = _getItemKey(item, key)

    // 针对list和item的情况，即有key属性值
    if (itemKey) {

      // 若删除了其中的某个，比如从 li[key="1"], li[key="2"] 变成了 li[key="1"]
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null)

      // 不变
      } else {
        let newItemIndex = newKeyIndex[itemKey]
        children.push(newList[newItemIndex])
      }

    // 没有key属性值的情况
    } else {

      let freeItem = newFree[freeIndex++]
      children.push(freeItem || null)
    }

    ++i
  }

  // children数组的副本
  let simulateList = children.slice()

  // 将标记为null的移除
  i = 0
  while (i < simulateList.length) {

    if (simulateList[i] === null) {
      _remove(moves, i)
      _removeSimulate(simulateList, i)

    } else {
      i++
    }
  }

  // i is cursor pointing to a item in new list
  // j is cursor pointing to a item in simulateList
  let j = i = 0

  while (i < newList.length) {

    item = newList[i]
    itemKey = _getItemKey(item, key)

    // 其实simulateList与oldList是一样的
    let simulateItem = simulateList[j]
    let simulateItemKey = _getItemKey(simulateItem, key)

    // 若用新的虚拟DOM数组的长度去遍历，对比出在旧的虚拟DOM数组中不存在，证明是增加的
    // 如旧的： [Velement(...), Velement(...)]，新的：  [Velement(...), Velement(...), Velement(...)]
    // 那么在旧的虚拟DOM的数组中, 索引为2的位置是不存在的，则走else，进行插入
    if (simulateItem) {

      // 若旧的元素的新的元素相同，跳过
      if (itemKey === simulateItemKey) {
        j++

      } else {

        // new item, just inesrt it
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          _insert(moves, i, item)

        } else {
          // if remove current simulateItem make item in right place
          // then just remove it
          let nextItemKey = _getItemKey(simulateList[j + 1], key)
          if (nextItemKey === itemKey) {
            _remove(moves, i)
            _removeSimulate(j)
            j++ // after removing, current j is right, just jump to next one

          } else {
            // else insert item
            _insert(moves, i, item)
          }
        }
      }

    } else {
      _insert(moves, i, item)
    }

    ++i
  }

  return {
    moves,
    children
  }
}
