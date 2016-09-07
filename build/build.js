var babel = require('babel-core')
var fs = require('fs')
var path = require('path')
var archiver = require('archiver')

console.log('transform to es5...')
var file2trans = ['js/subm.js']
file2trans.forEach(function (filename) {
  var ret = babel.transformFileSync(filename, {
    presets: ['es2015']
  })
  var newName = filename.replace(/\.js$/, '-es5.js')
  fs.writeFileSync(newName, ret.code)
})


// 同步manifest的版本
console.log('sync version...')
var package = require('../package')
var manifest = fs.readFileSync('manifest.json', {
  encoding: 'utf-8'
})
manifest = manifest.replace(/("version"\s*:\s*)"(\d+\.\d+\.\d+)"/, function (_, v) {
  return v + '"' + package.version + '"';
})
fs.writeFileSync('manifest.json', manifest)

// 压缩成zip
console.log('ziping...')
try {fs.mkdirSync('versions')} catch (e) {}
var archive = archiver.create('zip', {})
var output = fs.createWriteStream('versions/mlh-'+package.version+'.zip')
var zipDirs = ['bootstrap-3.2.0', 'css', 'icon', 'img', 'js', '_locales']
var zipFiles = ['background.html', 'manifest.json', 'options.html', 'popup.html']

archive.pipe(output)

zipDirs.forEach(function (dir) {
  archive.directory(dir, dir)
})
zipFiles.forEach(function (file) {
  archive.file(file)
})
archive.finalize()