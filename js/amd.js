// very simple amd loader, only for typescript outFile with amd module.
// author: spacemeowx2

(function (w) {
  let modules = new Map()
  function define(name, deps, fn) {
    const mod = {
      name,
      deps,
      fn
    }
    modules.set(name, mod)
  }
  function require(name) {
    const mod = modules.get(name)
    let out = {}
    if (!(mod && mod.mod)) {
      const deps = mod.deps.map(n => n === 'exports' ? out : require(n))
      mod.fn(...deps)
    }
    return out
  }
  define('require', [], () => {
    return require
  })
  w.define = define
  w.require = require
})(this)
