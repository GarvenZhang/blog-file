//===================================== 完整版 =======================================//

(function(modules) {

	// The module cache
	var installedModules = {};

	// The require function
	function __webpack_require__(moduleId) {

		// Check if module is in cache
		if(installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}
		// Create a new module (and put it into the cache)
		var module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
		};

		// Execute the module function
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		// Flag the module as loaded
		module.l = true;

		// Return the exports of the module
		return module.exports;
	}


	// expose the modules object (__webpack_modules__)
	__webpack_require__.m = modules;

	// expose the module cache
	__webpack_require__.c = installedModules;

	// define getter function for harmony exports
	__webpack_require__.d = function(exports, name, getter) {
		if(!__webpack_require__.o(exports, name)) {
			Object.defineProperty(exports, name, {
				configurable: false,
				enumerable: true,
				get: getter
			});
		}
	};

	// getDefaultExport function for compatibility with non-harmony modules
	__webpack_require__.n = function(module) {
		var getter = module && module.__esModule ?
			function getDefault() { return module['default']; } :
			function getModuleExports() { return module; };
		__webpack_require__.d(getter, 'a', getter);
		return getter;
	};

	// Object.prototype.hasOwnProperty.call
	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

	// __webpack_public_path__
	__webpack_require__.p = "";

	// Load entry module and return exports
	return __webpack_require__(__webpack_require__.s = 1);
})([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let num = 0

let foo = function () {
  num = 1
  return num
}

/* harmony default export */ __webpack_exports__["a"] = (foo());


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__c__ = __webpack_require__(3);




/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__a__ = __webpack_require__(0);


console.log(__WEBPACK_IMPORTED_MODULE_0__a__["a" /* default */])


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__a__ = __webpack_require__(0);


console.log(__WEBPACK_IMPORTED_MODULE_0__a__["a" /* default */])


/***/ }
])


//===================================== 从整体看 =======================================//
// === 整个bundle.js就是一个IIFE, 传入的是依赖的模块 === //

const arr = [
  /* 0 */
  (function(module, __webpack_exports__, __webpack_require__) {

    let num = 0

    let foo = function () {
      num = 1
      return num
    }

    __webpack_exports__["a"] = (foo());

  }),
  /* 1 */
  (function(module, __webpack_exports__, __webpack_require__) {

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(2);
    var __WEBPACK_IMPORTED_MODULE_1__c__ = __webpack_require__(3);

  }),
  /* 2 */
  (function(module, __webpack_exports__, __webpack_require__) {

    var __WEBPACK_IMPORTED_MODULE_0__a__ = __webpack_require__(0);

    console.log(__WEBPACK_IMPORTED_MODULE_0__a__["a" /* default */])


  }),
  /* 3 */
  (function(module, __webpack_exports__, __webpack_require__) {

    var __WEBPACK_IMPORTED_MODULE_0__a__ = __webpack_require__(0);

    console.log(__WEBPACK_IMPORTED_MODULE_0__a__["a" /* default */])

  })
]

(function(modules) {

  var installedModules = {};

  function __webpack_require__(moduleId) {

    return module.exports;
  }

  __webpack_require__(1)
})(arr)

//===================================== 分析 IIFE =======================================//

function(arr) {

  var installedModules = {};

  function __webpack_require__(moduleId) {

    // 检测是否已加载
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    // 创建一个新模块并将它放进 installedModules
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    }

    // 执行传入的 数组 中的每个模块
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)

    // 标志该模块已加载
    module.l = true;

    // 返回模块接口
    return module.exports
  }

  // 执行数组中的第二个模块
  __webpack_require__(1)
}

//===================================== 分析 modules[moduleId].call(module.exports, module, module.exports, __webpack_require__) =======================================//

modules[1].call(module.exports, module, module.exports, __webpack_require__)

/* 1 */
(function(module, __webpack_exports__, __webpack_require__) {

  // 递归调用 模块1 所依赖的 其它模块
  __webpack_require__(2)
  __webpack_require__(3)

})

/* 2 */
(function(module, __webpack_exports__, __webpack_require__) {

  console.log(__webpack_require__(0)["a" /* default */])

})

/* 3 */
(function(module, __webpack_exports__, __webpack_require__) {

  console.log(__webpack_require__(0)["a" /* default */])

})

/* 0 */
(function(module, __webpack_exports__, __webpack_require__) {

  let num = 0

  let foo = function () {
    num = 1
    return num
  }

  __webpack_exports__["a"] = (foo())

})

//===================================== 分析 模块间执行关系 =======================================//

/* 1 */
(function(module, __webpack_exports__, __webpack_require__) {

  // 递归调用 模块1 所依赖的 其它模块
  __webpack_require__(2)
  __webpack_require__(3)

})

/* 2 */
(function() {

  console.log(window.A)

})

/* 3 */
(function() {

  console.log(window.A)

})

/* 0 */
(function() {

  let num = 0

  let foo = function () {
    num = 1
    return num
  }

  // 伪代码, 挂载到window上 容易看出其它模块的 引用
  window.A = foo()

})

// === webpack源码分析-输出文件:  === //
// === 1 输出的文件只是一个IIFE, 传入的是由所有模块组成的数组, IIFE内部的核心是 __webpack_require__ 函数 === //
// === 2 webpack从入口js文件开始, 将所有 import 的文件 放进数组, 公共依赖的放前面, 到入口文件的时候, 标记其索引位置, 整个IIFE内部的执行就是从此文件开始( return __webpack_require__(__webpack_require__.s = 1 ) === //
// === 3 IIFE内部会有一个缓存对象 installedModules, 在执行 __webpack_require__ 函数时会判断是否在缓存中, 不是的话就 为该模块 新建一个module对象 ({i: moduleId, l: false, exports: {}) 并放入缓存, 更新 l 标记, exports 是该模块需要暴露的变量 === //
// === 4 执行 入口文件 模块, 其中有依赖的, 调用 __webpack_require__ 以递归的方式再执行其他模块 === //
// === 5 可以看出, 多个模块 引用 同一个模块, 该模块只会执行一次, 获取到的接口都相同, 即 b 和 c 获取到的都是 a, 这跟 以前没有 html中所有脚本文件 都在全局下工作 的情况一样 === //
