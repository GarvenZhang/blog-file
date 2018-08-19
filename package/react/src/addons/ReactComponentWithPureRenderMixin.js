/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactComponentWithPureRenderMixin
 */

'use strict';

var shallowCompare = require('shallowCompare');

/**
 * If your React component's render function is "pure", e.g. it will render the
 * same result given the same props and state, provide this mixin for a
 * considerable performance boost.
 *
 * Most React components have pure render functions.
 *
 * Example:
 *
 *   var ReactComponentWithPureRenderMixin =
 *     require('ReactComponentWithPureRenderMixin');
 *   React.createClass({
 *     mixins: [ReactComponentWithPureRenderMixin],
 *
 *     render: function() {
 *       return <div className={this.props.className}>foo</div>;
 *     }
 *   });
 *
 * Note: This only checks shallow equality for props and state. If these contain
 * complex data structures this mixin may have false-negatives for deeper
 * differences. Only mixin to components which have simple props and state, or
 * use `forceUpdate()` when you know deep data structures have changed.
 *
 * See https://facebook.github.io/react/docs/pure-render-mixin.html
 */

// === shouldComponentUpdate(nextProps, nextState): 每当state或者props有变化时都会触发更新的生命周期流程, 首先 shouldCompoenntUpdate() 会触发, 默认是返回true, 即允许重新渲染 === //
// === 1 作用: 一般用于性能优化, 有两种场景: === //
// === 1.1 当明确得知这次 更新了state或者props的值 但又 无需重新渲染时使用, 此时可定制化 shouldComponentUpdate() === //
// === 1.2 当组件没有自己的 state , 完全依赖于外部传的 props 来渲染时使用, 此时采用内置的 PureComponent 会更好, 其原理也是通过 浅层比较 下一次的 props 和 states 和 现在的 是否一致, 若都一致则无需重新渲染, 因此不适合 具有复杂数据结构 的 props 或者 state   === //
// === 2 性能优化工具查看: 在 chrome 中的 url 上加上参数 ?react_perf , 在 Perfomance 面板会出现相应的 react 渲染时间 === //

var ReactComponentWithPureRenderMixin = {
  shouldComponentUpdate: function(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  },
};

module.exports = ReactComponentWithPureRenderMixin;
