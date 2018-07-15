import patch from './patch.js'
import listDiff from './list-diff.js'

// === diff算法: 因为真实DOM的操作代价很大，所以可以在页面状态发生改变时先通过虚拟DOM用diff算法计算出真实DOM的最小修改量，然后再修改真实DOM结构 === //
// === 1 策略: === //
// === 1.1 tree diff: DOM跨层级操作很少, 当发现节点已经不存在时，则该节点及其子节点会被完全删除掉，不会用于进一步的比较 === //
// === 1.1.a 例子: diff的操作为 create A → create B → create C → delete A === //
/* A移到D下面
    R                 R
  A   D     ->          D
B   C                 A
                    B   C
*/
// === 1.1.b 优化: 不要进行跨层级DOM操作, 耗性能 === //
// === 1.2 component diff: 相同类的两个组件生成类似树形结构，继续比较vdom树; 不同类的生成不同的树形结构, 替换整个节点下的所有子节点=== //
// === 1.2.a 例子: diff判断D, G为不同类型组件则不会比较，而是直接删除D, 并重新创建G及其子组件 === //
/* D变为了G
        R                       R
    A       D       ->      A       G
  B   C   E   F           B   C   E   F
*/
// === 1.2.b 优化: 对于同一类型的组件，有可能其 Virtual DOM 没有任何变化，如果能够确切知道这点，那么就可以节省大量的 diff 运算时间。因此，React 允许用户通过 shouldComponentUpdate() 来判断该组件是否需要进行 diff 算法分析。 === //
// === 1.3 element diff: 同一层级的子节点可通过id区分, diff提供3种操作 --- 插入，移动，删除 === //

// === 1 要点: === //
// === 1.1 如何比较两颗DOM树: 因为很少跨级别的修改DOM节点，通常是修改节点的属性，调整节点的顺序，添加子节点等，因此只需对同级别节点进行比较，同级别的比较可用 深度优先遍历 === //
// === 1.1.a 深度优先遍历: 遍历过程中, 每个节点都有个编号, 若对应的节点有变化, 只需把响应的变化的类别记录下来 === //
// === 1.2 如何记录节点之间的差异: 同级之间节点的差异有四类 --- 修改节点属性、修改节点文本内容、替换原有节点、调整子节点(包括移动，删除等) === //

/**
 * DFS
 * @param {Object} oldNode 旧的虚拟dom树
 * @param {Object} newNode 新的虚拟dom树
 *
 */
function _dfsWalk (oldNode, newNode, index, patches) {

  let currentPatch = []
  
  if (newNode === null) {

  // 如果是文本节点则直接替换文本
  } else if (typeof oldNode === 'string' && typeof newNode === 'string') {
    
    if (oldNode !== newNode) {
      currentPatch.push({
        type: patch.TEXT,
        content: newNode
      })
    }
    
  } else if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
    
    // 节点类型相同
    // 比较节点的属性是否相同
    let propsPatches = _diffProps(oldNode, newNode)
    
    if (propsPatches) {
      currentPatch.push({
        type: patch.PROPS,
        props: propsPatches
      })
    }
    
    // 比较子节点是否相同
    _diffChildren(oldNode.children, newNode.children, index, patches, currentPatch)
    
  } else {
    
    // 节点的类型不同，直接替换
    currentPatch.push({ type: patch.REPLACE, node: newNode })
    
  }

  currentPatch.length && (patches[index] = currentPatch)
  
}

/**
 * 比较属性的不同
 * @param {Object} oldNode 旧的虚拟DOM
 * @param {Object} newNode 新的虚拟DOM
 * @return {Object|Null}
 */
function _diffProps (oldNode, newNode) {

  let oldProps = oldNode.props
  let newProps = newNode.props

  // 记录不同项
  let count = 0
  let propsPatches = {}

  // 找出不同的属性: 遍历oldProps，同一属性名在newPops中为不同的值
  for (const key in oldProps) {

    if (newProps[key] === oldProps[key]) {
      continue
    }

    ++count
    propsPatches[key] = newProps[key]

  }

  // 找出新增的属性: 遍历newProps, 同一属性名在oldProps中不存在
  for (const key in newProps) {

    if (oldProps.hasOwnProperty(key)) {
      continue
    }

    ++count
    propsPatches[key] = newProps[key]

  }

  // 若没有不同项
  return count === 0 ? null : propsPatches
}

/**
 * 比较子节点
 * @param {Array} oldChildren 旧的子节点
 * @param {Array} newChildren 新的子节点
 * @param {Number} index
 * @param {Object} patches 不同项
 * @param {Array} currentPatch 当前节点新旧比较出的不同项
 */
function _diffChildren (oldChildren, newChildren, index, patches, currentPatch) {

  let diffs = listDiff(oldChildren, newChildren, 'key')

  newChildren = diffs.children

  // 把当前的子元素的变化记录到currentPatch
  if (diffs.moves.length) {

    currentPatch.push({
      type: patch.REORDER,
      moves: diffs.moves
    })
  }

  let leftNode = null
  let currentNodeIndex = index

  oldChildren.forEach((child, i) => {

    let newChild = newChildren[i]

    currentNodeIndex = (leftNode && leftNode.count) ? currentNodeIndex + leftNode.count + 1 : currentNodeIndex + 1

    _dfsWalk(child, newChild, currentNodeIndex, patches)

    leftNode = child

  })
}

/**
 * diff算法
 * @param {Object} oldTree 旧的虚拟dom树
 * @param {Object} newTree 新的虚拟dom树
 * @return {Object}
 */
export default function (oldTree, newTree) {
  // 节点的遍历顺序
  let index = 0
  // 遍历过程中记载节点的差异
  let patches = {}
  // 深度优先遍历两棵树
  _dfsWalk(oldTree, newTree, index, patches)
  return patches
}