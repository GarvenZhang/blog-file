
module.exports = Module

function stat (filename) {
  filename = path.toNamespacedPath(filename)
  const cache = stat.cache
  if (cache !== null) {
    const result = cache.get(filename)
    if (result !== undefined) return result
  }
  const result = internalModuleStat(filename)
  if (cache !== null) cache.set(filename, result)
  return result
}
stat.cache = null

function updateChildren (parent, child, scan) {
  var children = parent && parent.children
  if (children && !(scan && children.includes(child))) { children.push(child) }
}

/**
 * module构造函数
 */
function Module (id, parent) {
  this.id = id

  // 平时用的 module.exports, 就是一个对象
  this.exports = {}

  this.parent = parent
  updateChildren(parent, this, false)
  this.filename = null
  this.loaded = false
  this.children = []
}

Module._cache = Object.create(null)
Module._pathCache = Object.create(null)
Module._extensions = Object.create(null)

var modulePaths = []
Module.globalPaths = []

// js iife 包装
Module.wrap = function (script) {
  return '(function (exports, require, module, __filename, __dirname) { ' + script + '\n});'
}

// given a module name, and a list of paths to test, returns the first
// matching file in the following precedence.
//
// require("a.<ext>")
//   -> a.<ext>
//
// require("a")
//   -> a
//   -> a.<ext>
//   -> a/index.<ext>

// check if the directory is a package.json dir
const packageMainCache = Object.create(null)

function readPackage (requestPath) {
  const entry = packageMainCache[requestPath]
  if (entry) { return entry }

  const jsonPath = path.resolve(requestPath, 'package.json')
  const json = internalModuleReadJSON(path.toNamespacedPath(jsonPath))

  if (json === undefined) {
    return false
  }

  try {
    return packageMainCache[requestPath] = JSON.parse(json).main
  } catch (e) {
    e.path = jsonPath
    e.message = 'Error parsing ' + jsonPath + ': ' + e.message
    throw e
  }
}

function tryPackage (requestPath, exts, isMain) {
  var pkg = readPackage(requestPath)

  if (!pkg) return false

  var filename = path.resolve(requestPath, pkg)
  return tryFile(filename, isMain) ||
         tryExtensions(filename, exts, isMain) ||
         tryExtensions(path.resolve(filename, 'index'), exts, isMain)
}

// In order to minimize unnecessary lstat() calls,
// this cache is a list of known-real paths.
// Set to an empty Map to reset.
const realpathCache = new Map()

// check if the file exists and is not a directory
// if using --preserve-symlinks and isMain is false,
// keep symlinks intact, otherwise resolve to the
// absolute realpath.
function tryFile (requestPath, isMain) {
  const rc = stat(requestPath)
  if (preserveSymlinks && !isMain) {
    return rc === 0 && path.resolve(requestPath)
  }
  return rc === 0 && toRealPath(requestPath)
}

function toRealPath (requestPath) {
  return fs.realpathSync(requestPath, {
    [internalFS.realpathCacheKey]: realpathCache
  })
}

// given a path, check if the file exists with any of the set extensions
function tryExtensions (p, exts, isMain) {
  for (var i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i], isMain)

    if (filename) {
      return filename
    }
  }
  return false
}

/**
 * 确定正确路径
 */
Module._findPath = function (request, paths, isMain) {

  if (path.isAbsolute(request)) {
    paths = ['']
  }

  var cacheKey = request + '\x00' +
                (paths.length === 1 ? paths[0] : paths.join('\x00'))
  var entry = Module._pathCache[cacheKey]
  if (entry) { return entry }

  var exts
  var trailingSlash = request.length > 0 && request.charCodeAt(request.length - 1) === CHAR_FORWARD_SLASH

  if (!trailingSlash) {
    trailingSlash = /(?:^|\/)\.?\.$/.test(request)
  }

  // For each path
  for (var i = 0; i < paths.length; i++) {
    // Don't search further if path doesn't exist
    const curPath = paths[i]
    if (curPath && stat(curPath) < 1) continue
    var basePath = path.resolve(curPath, request)
    var filename

    var rc = stat(basePath)
    if (!trailingSlash) {
      if (rc === 0) {  // File.
        if (!isMain) {
          if (preserveSymlinks) {
            filename = path.resolve(basePath)
          } else {
            filename = toRealPath(basePath)
          }
        } else if (preserveSymlinksMain) {
          // For the main module, we use the preserveSymlinksMain flag instead
          // mainly for backward compatibility, as the preserveSymlinks flag
          // historically has not applied to the main module.  Most likely this
          // was intended to keep .bin/ binaries working, as following those
          // symlinks is usually required for the imports in the corresponding
          // files to resolve; that said, in some use cases following symlinks
          // causes bigger problems which is why the preserveSymlinksMain option
          // is needed.
          filename = path.resolve(basePath)
        } else {
          filename = toRealPath(basePath)
        }
      }

      if (!filename) {
        // try it with each of the extensions
        if (exts === undefined) { exts = Object.keys(Module._extensions) }
        filename = tryExtensions(basePath, exts, isMain)
      }
    }

    if (!filename && rc === 1) {  // Directory.
      // try it with each of the extensions at "index"
      if (exts === undefined) { exts = Object.keys(Module._extensions) }
      filename = tryPackage(basePath, exts, isMain)
      if (!filename) {
        filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain)
      }
    }

    if (filename) {
      // Warn once if '.' resolved outside the module dir
      if (request === '.' && i > 0) {
        if (!warned) {
          warned = true
          process.emitWarning(
            'warning: require(\'.\') resolved outside the package ' +
            'directory. This functionality is deprecated and will be removed ' +
            'soon.',
            'DeprecationWarning', 'DEP0019')
        }
      }

      Module._pathCache[cacheKey] = filename
      return filename
    }
  }

  return false
}

// 'node_modules' character codes reversed
var nmChars = [ 115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110 ]
var nmLen = nmChars.length
if (process.platform === 'win32') {
  // 'from' is the __dirname of the module.
  Module._nodeModulePaths = function (from) {
    // guarantee that 'from' is absolute.
    from = path.resolve(from)

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.

    // return root node_modules when path is 'D:\\'.
    // path.resolve will make sure from.length >=3 in Windows.
    if (from.charCodeAt(from.length - 1) === CHAR_BACKWARD_SLASH &&
        from.charCodeAt(from.length - 2) === CHAR_COLON) { return [from + 'node_modules'] }

    const paths = []
    var p = 0
    var last = from.length
    for (var i = from.length - 1; i >= 0; --i) {
      const code = from.charCodeAt(i)
      // The path segment separator check ('\' and '/') was used to get
      // node_modules path for every path segment.
      // Use colon as an extra condition since we can get node_modules
      // path for drive root like 'C:\node_modules' and don't need to
      // parse drive name.
      if (code === CHAR_BACKWARD_SLASH ||
          code === CHAR_FORWARD_SLASH ||
          code === CHAR_COLON) {
        if (p !== nmLen) { paths.push(from.slice(0, last) + '\\node_modules') }
        last = i
        p = 0
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p
        } else {
          p = -1
        }
      }
    }

    return paths
  }
} else { // posix
  // 'from' is the __dirname of the module.
  Module._nodeModulePaths = function (from) {
    // guarantee that 'from' is absolute.
    from = path.resolve(from)
    // Return early not only to avoid unnecessary work, but to *avoid* returning
    // an array of two items for a root: [ '//node_modules', '/node_modules' ]
    if (from === '/') { return ['/node_modules'] }

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.
    const paths = []
    var p = 0
    var last = from.length
    for (var i = from.length - 1; i >= 0; --i) {
      const code = from.charCodeAt(i)
      if (code === CHAR_FORWARD_SLASH) {
        if (p !== nmLen) { paths.push(from.slice(0, last) + '/node_modules') }
        last = i
        p = 0
      } else if (p !== -1) {
        if (nmChars[p] === code) {
          ++p
        } else {
          p = -1
        }
      }
    }

    // Append /node_modules to handle root paths.
    paths.push('/node_modules')

    return paths
  }
}

// 'index.' character codes
var indexChars = [ 105, 110, 100, 101, 120, 46 ]
var indexLen = indexChars.length
Module._resolveLookupPaths = function (request, parent, newReturn) {
  if (NativeModule.nonInternalExists(request)) {
    debug('looking for %j in []', request)
    return (newReturn ? null : [request, []])
  }

  // Check for relative path
  if (request.length < 2 ||
      request.charCodeAt(0) !== CHAR_DOT ||
      (request.charCodeAt(1) !== CHAR_DOT &&
       request.charCodeAt(1) !== CHAR_FORWARD_SLASH)) {
    var paths = modulePaths
    if (parent) {
      if (!parent.paths) { paths = parent.paths = [] } else { paths = parent.paths.concat(paths) }
    }

    // Maintain backwards compat with certain broken uses of require('.')
    // by putting the module's directory in front of the lookup paths.
    if (request === '.') {
      if (parent && parent.filename) {
        paths.unshift(path.dirname(parent.filename))
      } else {
        paths.unshift(path.resolve(request))
      }
    }

    debug('looking for %j in %j', request, paths)
    return (newReturn ? (paths.length > 0 ? paths : null) : [request, paths])
  }

  // with --eval, parent.id is not set and parent.filename is null
  if (!parent || !parent.id || !parent.filename) {
    // make require('./path/to/foo') work - normally the path is taken
    // from realpath(__filename) but with eval there is no filename
    var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths)

    debug('looking for %j in %j', request, mainPaths)
    return (newReturn ? mainPaths : [request, mainPaths])
  }

  // Is the parent an index module?
  // We can assume the parent has a valid extension,
  // as it already has been accepted as a module.
  const base = path.basename(parent.filename)
  var parentIdPath
  if (base.length > indexLen) {
    var i = 0
    for (; i < indexLen; ++i) {
      if (indexChars[i] !== base.charCodeAt(i)) { break }
    }
    if (i === indexLen) {
      // We matched 'index.', let's validate the rest
      for (; i < base.length; ++i) {
        const code = base.charCodeAt(i)
        if (code !== CHAR_UNDERSCORE &&
            (code < CHAR_0 || code > CHAR_9) &&
            (code < CHAR_UPPERCASE_A || code > CHAR_UPPERCASE_Z) &&
            (code < CHAR_LOWERCASE_A || code > CHAR_LOWERCASE_Z)) { break }
      }
      if (i === base.length) {
        // Is an index module
        parentIdPath = parent.id
      } else {
        // Not an index module
        parentIdPath = path.dirname(parent.id)
      }
    } else {
      // Not an index module
      parentIdPath = path.dirname(parent.id)
    }
  } else {
    // Not an index module
    parentIdPath = path.dirname(parent.id)
  }
  var id = path.resolve(parentIdPath, request)

  // make sure require('./path') and require('path') get distinct ids, even
  // when called from the toplevel js file
  if (parentIdPath === '.' && id.indexOf('/') === -1) {
    id = './' + id
  }

  debug('RELATIVE: requested: %s set ID to: %s from %s', request, id,
        parent.id)

  var parentDir = [path.dirname(parent.filename)]
  debug('looking for %j in %j', id, parentDir)
  return (newReturn ? parentDir : [id, parentDir])
}

/**
 * 加载引入的文件
 * 1 若模块已存在于缓存则返回其 exports 对象
 * 2 若模块为原生则用 NativeModule.require() 加载并返回结果
 * 3 否则为文件创建一个新模块并放在缓存中，在返回它的 exports 对象之前加载其内容
 */
Module._load = function (request, parent, isMain) {

  // 分析出文件名
  var filename = Module._resolveFilename(request, parent, isMain)

  // 看是否在缓存模块中有, 有就直接返回其 exports
  var cachedModule = Module._cache[filename]
  if (cachedModule) {
    updateChildren(parent, cachedModule, true)
    return cachedModule.exports
  }

  // 若原生模块
  if (NativeModule.nonInternalExists(filename)) {
    return NativeModule.require(filename)
  }

  // 不然就创建新模块
  var module = new Module(filename, parent)

  // 缓存, 以filename为key
  Module._cache[filename] = module

  // 尝试加载模块
  // 模块加载不成功则将其从 Module._cache中删除
  var threw = true
  try {
    module.load(filename)
    threw = false
  } finally {
    if (threw) {
      delete Module._cache[filename]
    }
  }

  // 返回exports属性
  return module.exports
}

/**
 * 获取 filename
 * 列出可能的路径
 */
Module._resolveFilename = function (request, parent, isMain, options) {

  var paths

  // 分析出 可能的paths
  if (typeof options === 'object' && options !== null && Array.isArray(options.paths)) {

    paths = []

    for (var i = 0; i < options.paths.length; i++) {
       // ...
    }

  } else {
    paths = Module._resolveLookupPaths(request, parent, true)
  }

  // 根据path 得出 filename, 确认哪一个路径为真
  var filename = Module._findPath(request, paths, isMain)

  return filename
}

/**
 * 根据 filename 解析出 后缀名 并 传给相应的后缀处理函数
 */
Module.prototype.load = function (filename) {

  // 分析出 filenames, paths, extension
  this.filename = filename
  this.paths = Module._nodeModulePaths(path.dirname(filename))
  var extension = path.extname(filename) || '.js'
  if (!Module._extensions[extension]) {
    extension = '.js'
  }
  Module._extensions[extension](this, filename)
  this.loaded = true

  // 若为实验性模块
  if (experimentalModules) {
    if (asyncESM === undefined) lazyLoadESM()
    const ESMLoader = asyncESM.ESMLoader
    const url = getURLFromFilePath(filename)
    const urlString = `${url}`
    const exports = this.exports
    if (ESMLoader.moduleMap.has(urlString) !== true) {
      ESMLoader.moduleMap.set(
        urlString,
        new ModuleJob(ESMLoader, url, async () => {
          const ctx = createDynamicModule(
            ['default'], url)
          ctx.reflect.exports.default.set(exports)
          return ctx
        })
      )
    } else {
      const job = ESMLoader.moduleMap.get(urlString)
      if (job.reflect) { job.reflect.exports.default.set(exports) }
    }
  }
}

/**
 * 平时的 require('xxx.js') 方法, 返回 module's exports 属性
 */
Module.prototype.require = function (id) {

  return Module._load(id, this, /* isMain */ false)

}

/**
 * 在正确的域 或 沙箱 中运行文件内容, 暴露正确的变量(require, module, exports)
 */
Module.prototype._compile = function (content, filename) {

  content = stripShebang(content)

  /**
   * 将内容包装成如下:
   (function (exports, require, module, __filename, __dirname) {
      // content
   })
   */
  var wrapper = Module.wrap(content)

  // 在解释器中运行代码
  var compiledWrapper = vm.runInThisContext(wrapper, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  })

  var dirname = path.dirname(filename)
  var require = makeRequireFunction(this)
  var depth = requireDepth

  if (depth === 0) {
    stat.cache = new Map()
  }

  var result = compiledWrapper.call(this.exports, this.exports, require, this, filename, dirname)
  if (depth === 0) {
    stat.cache = null
  }

  return result
}

/**
 * .js 后缀处理函数
 */
Module._extensions['.js'] = function (module, filename) {
  // 同步加载文件
  var content = fs.readFileSync(filename, 'utf8')
  // 剥离 utf8 编码特有的BOM文件头
  // 编译文件内容
  module._compile(stripBOM(content), filename)
}

// Native extension for .json
Module._extensions['.json'] = function (module, filename) {

  var content = fs.readFileSync(filename, 'utf8')
  module.exports = JSON.parse(stripBOM(content))

}

// Native extension for .node
Module._extensions['.node'] = function (module, filename) {
  return process.dlopen(module, path.toNamespacedPath(filename))
}

Module._initPaths()

// === commonjs模块加载: === //
// === 1 实质: 注入exports、require、module三个全局变量，然后执行模块的源码，然后将模块的 exports 变量的值输出 === //
// === 2 过程: === //
/*



*/
