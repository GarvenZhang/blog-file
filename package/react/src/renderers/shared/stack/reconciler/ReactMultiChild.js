// === diff算法：React 将 VDOM树 转化成 actual DOM 树的最少操作称为 调和(reconciliation) , diff算法便是调和的具体实现 === //
// === 1 传统diff算法复杂度: O(n^3), n为树中节点总数 === //
// === 2 react diff: 通过策略将O(n^3)问题转化为O(n) === //
// === 3 策略: === //
// === 3.1 DOM节点跨层级的操作特别少可不计 === //
// === 3.2 拥有相同类的两个组件将生成相似的树形结构, 不同类的两个组件将生成不同的属性结构 === //
// === 3.3 同一层级的一组子节点, 通过唯一id区分 === //
// === 4 diff类型: === //
// === 4.1 tree diff: 当发现节点已不存在时会将该节点及其子节点完全删除, 不用于进一步比较; 如将左子节点移到右子节点上, 实质上是先在右子节点上一一创建左子节点及其后代, 再删除左子节点 === //
// === 4.1.1 优化: 开发时尽量减少将一颗 子树 移动到另一个子节点上 的情况, 可以CSS隐藏或显示节点而非真正移除或添加节点 === //
// === 4.2 component diff: 若某一组件变成了另一组件, 会判断其类型, 若不同则判断为dirty component, 替换整个组件下的所有子节点; 若同, 可通过 shouldComponentUpdate 来判断该组件是否需要进行diff算法分析来进行优化 === //
// === 4.3 element diff: 比如有集合 A, B, C, D, 遍历新集合节点, 与旧集合中的进行对比, 用一个变量记录遍历过的节点在旧集合中的最右值, 若本次遍历时节点在旧集合中的位置大于最右值, 则表明对其它节点没影响, 则不进行移动, 若小于此最右值, 则表明会影响到已经排好序的节点, 则进行移动; 其中对于新增节点, 直接新增; 将新集合中的节点遍历完后发现旧集合还有未处理的节点则直接删除 === //
// === 4,3.1 局限: 若 A, B, C, D 变成 D, A, B, C 则需要将 A, B, C 移到 D 后面而非将 D 移到 第一位, 因此开发时尽量减少最后一个节点移动到首部的情况 === //

/**
 * 新的组件类型不在就集合里, 需对新节点执行插入操作
 */
function makeInsertMarkup(markup, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'INSERT_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex: toIndex,
    afterNode: afterNode,
  };
}

/**
 * 旧集合中有新组件类型, 可复用以前的DOM节点, 进行移动操作
 */
function makeMove(child, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'MOVE_EXISTING',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: ReactReconciler.getHostNode(child),
    toIndex: toIndex,
    afterNode: afterNode,
  };
}

/**
 * 就组件类型, 在新集合里也有, 但对应的element不同则不能直接复用和更新, 或就组建不在新集合中, 需执行删除操作
 */
function makeRemove(child, node) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'REMOVE_NODE',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: node,
    toIndex: null,
    afterNode: null,
  };
}

/**
 * Make an update for setting the markup of a node.
 *
 * @param {string} markup Markup that renders into an element.
 * @private
 */
function makeSetMarkup(markup) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'SET_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex: null,
    afterNode: null,
  };
}

/**
 * Make an update for setting the text content.
 *
 * @param {string} textContent Text content to set.
 * @private
 */
function makeTextContent(textContent) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'TEXT_CONTENT',
    content: textContent,
    fromIndex: null,
    fromNode: null,
    toIndex: null,
    afterNode: null,
  };
}

/**
 * 如果有更新则入队列
 */
function enqueue(queue, update) {
  if (update) {
    queue = queue || [];
    queue.push(update);
  }
  return queue;
}

/**
 * 处理队列的更新
 */
function processQueue(inst, updateQueue) {
  ReactComponentEnvironment.processChildrenUpdates(inst, updateQueue);
}

var setChildrenForInstrumentation = emptyFunction;
if (__DEV__) {
  var getDebugID = function(inst) {
    if (!inst._debugID) {
      // Check for ART-like instances. TODO: This is silly/gross.
      var internal;
      if ((internal = ReactInstanceMap.get(inst))) {
        inst = internal;
      }
    }
    return inst._debugID;
  };
  setChildrenForInstrumentation = function(children) {
    var debugID = getDebugID(this);
    // TODO: React Native empty components are also multichild.
    // This means they still get into this method but don't have _debugID.
    if (debugID !== 0) {
      ReactInstrumentation.debugTool.onSetChildren(
        debugID,
        children
          ? Object.keys(children).map(key => children[key]._debugID)
          : [],
      );
    }
  };
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
var ReactMultiChild = {
  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
  Mixin: {
    _reconcilerInstantiateChildren: function(
      nestedChildren,
      transaction,
      context,
    ) {
      if (__DEV__) {
        var selfDebugID = getDebugID(this);
        if (this._currentElement) {
          try {
            ReactCurrentOwner.current = this._currentElement._owner;
            return ReactChildReconciler.instantiateChildren(
              nestedChildren,
              transaction,
              context,
              selfDebugID,
            );
          } finally {
            ReactCurrentOwner.current = null;
          }
        }
      }
      return ReactChildReconciler.instantiateChildren(
        nestedChildren,
        transaction,
        context,
      );
    },

    _reconcilerUpdateChildren: function(
      prevChildren,
      nextNestedChildrenElements,
      mountImages,
      removedNodes,
      transaction,
      context,
    ) {
      var nextChildren;
      var selfDebugID = 0;
      if (__DEV__) {
        selfDebugID = getDebugID(this);
        if (this._currentElement) {
          try {
            ReactCurrentOwner.current = this._currentElement._owner;
            nextChildren = flattenChildren(
              nextNestedChildrenElements,
              selfDebugID,
            );
          } finally {
            ReactCurrentOwner.current = null;
          }
          ReactChildReconciler.updateChildren(
            prevChildren,
            nextChildren,
            mountImages,
            removedNodes,
            transaction,
            this,
            this._hostContainerInfo,
            context,
            selfDebugID,
          );
          return nextChildren;
        }
      }
      nextChildren = flattenChildren(nextNestedChildrenElements, selfDebugID);
      ReactChildReconciler.updateChildren(
        prevChildren,
        nextChildren,
        mountImages,
        removedNodes,
        transaction,
        this,
        this._hostContainerInfo,
        context,
        selfDebugID,
      );
      return nextChildren;
    },

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
    mountChildren: function(nestedChildren, transaction, context) {
      var children = this._reconcilerInstantiateChildren(
        nestedChildren,
        transaction,
        context,
      );
      this._renderedChildren = children;

      var mountImages = [];
      var index = 0;
      for (var name in children) {
        if (children.hasOwnProperty(name)) {
          var child = children[name];
          var selfDebugID = 0;
          if (__DEV__) {
            selfDebugID = getDebugID(this);
          }
          var mountImage = ReactReconciler.mountComponent(
            child,
            transaction,
            this,
            this._hostContainerInfo,
            context,
            selfDebugID,
          );
          child._mountIndex = index++;
          mountImages.push(mountImage);
        }
      }

      if (__DEV__) {
        setChildrenForInstrumentation.call(this, children);
      }

      return mountImages;
    },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
    updateTextContent: function(nextContent) {
      var prevChildren = this._renderedChildren;
      // Remove any rendered children.
      ReactChildReconciler.unmountChildren(prevChildren, false);
      for (var name in prevChildren) {
        if (prevChildren.hasOwnProperty(name)) {
          invariant(false, 'updateTextContent called on non-empty component.');
        }
      }
      // Set new text content.
      var updates = [makeTextContent(nextContent)];
      processQueue(this, updates);
    },

    /**
     * Replaces any rendered children with a markup string.
     *
     * @param {string} nextMarkup String of markup.
     * @internal
     */
    updateMarkup: function(nextMarkup) {
      var prevChildren = this._renderedChildren;
      // Remove any rendered children.
      ReactChildReconciler.unmountChildren(prevChildren, false);
      for (var name in prevChildren) {
        if (prevChildren.hasOwnProperty(name)) {
          invariant(false, 'updateTextContent called on non-empty component.');
        }
      }
      var updates = [makeSetMarkup(nextMarkup)];
      processQueue(this, updates);
    },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
    updateChildren: function(nextNestedChildrenElements, transaction, context) {
      // Hook used by React ART
      this._updateChildren(nextNestedChildrenElements, transaction, context);
    },

    /**
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
    _updateChildren: function(
      nextNestedChildrenElements,
      transaction,
      context,
    ) {
      var prevChildren = this._renderedChildren;
      var removedNodes = {};
      var mountImages = [];
      var nextChildren = this._reconcilerUpdateChildren(
        prevChildren,
        nextNestedChildrenElements,
        mountImages,
        removedNodes,
        transaction,
        context,
      );

      var updates = null;
      var name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      var nextIndex = 0;
      var lastIndex = 0;
      // `nextMountIndex` will increment for each newly mounted child.
      var nextMountIndex = 0;
      var lastPlacedNode = null;
      for (name in nextChildren) {


        var prevChild = prevChildren && prevChildren[name];

        var nextChild = nextChildren[name];

        if (prevChild === nextChild) {

          updates = enqueue(
            updates,
            this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex),
          );
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          prevChild._mountIndex = nextIndex;

        } else {

          if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            // The `removedNodes` loop below will actually remove the child.
          }

          // The child must be instantiated before it's mounted.
          updates = enqueue(
            updates,
            this._mountChildAtIndex(
              nextChild,
              mountImages[nextMountIndex],
              lastPlacedNode,
              nextIndex,
              transaction,
              context,
            ),
          );
          nextMountIndex++;
        }
        nextIndex++;
        lastPlacedNode = ReactReconciler.getHostNode(nextChild);

      }
      // Remove children that are no longer present.
      for (name in removedNodes) {
        if (removedNodes.hasOwnProperty(name)) {
          updates = enqueue(
            updates,
            this._unmountChild(prevChildren[name], removedNodes[name]),
          );
        }
      }

      if (updates) {
        processQueue(this, updates);
      }

      this._renderedChildren = nextChildren;

    },

    /**
     * 卸载所有渲染的节点
     */
    unmountChildren: function(safely) {
      var renderedChildren = this._renderedChildren;
      ReactChildReconciler.unmountChildren(renderedChildren, safely);
      this._renderedChildren = null;
    },

    /**
     * 移动节点
     */
    moveChild: function(child, afterNode, toIndex, lastIndex) {
      // 如果子节点的 index 小于 lastIndex, 则移动该节点
      if (child._mountIndex < lastIndex) {
        return makeMove(child, afterNode, toIndex);
      }
    },

    /**
     * 创建节点
     */
    createChild: function(child, afterNode, mountImage) {
      return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
    },

    /**
     * 删除节点
     */
    removeChild: function(child, node) {
      return makeRemove(child, node);
    },

    /**
     * 通过提供的名称实例化子节点
     * @private
     */
    _mountChildAtIndex: function(
      child,
      mountImage,
      afterNode,
      index,
      transaction,
      context,
    ) {
      child._mountIndex = index;
      return this.createChild(child, afterNode, mountImage);
    },

    /**
     * 卸载已经渲染的子节点
     */
    _unmountChild: function(child, node) {
      var update = this.removeChild(child, node);
      child._mountIndex = null;
      return update;
    },
  },
};

module.exports = ReactMultiChild;
