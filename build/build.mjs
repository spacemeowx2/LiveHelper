import { Parcel } from '@parcel/core';
import fs from 'fs';
import archiver from 'archiver';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

async function main() {
  // 同步manifest的版本
  console.log('sync version...', packageJson.version)
  var manifest = fs.readFileSync('manifest.json', {
    encoding: 'utf-8'
  })
  manifest = manifest.replace(/("version"\s*:\s*)"(\d+\.\d+\.\d+)"/, function (_, v) {
    return v + '"' + packageJson.version + '"';
  })
  fs.writeFileSync('manifest.json', manifest)

  const bundler = new Parcel({
    entries: ['src/*.html', 'src/background.ts'],
    defaultConfig: '@parcel/config-default',
    targets: ['modern'],
    mode: 'production',
    env: {
      NODE_ENV: 'production'
    },
  })
  await bundler.run()
  let bundles = bundleGraph.getBundles();
  console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
  await zip('manifest.json', 'versions/mlh-' + packageJson.version + '.zip')
  console.log('done')
}
main().catch(e => console.error(e))


function zip(manifest, filename) {
  console.log('ziping...', manifest)
  var archive = archiver.create('zip', {})
  var output = fs.createWriteStream(filename)

  archive
    .directory('dist')
    .directory('icon')
    .directory('_locales')
    .file(manifest)
    .pipe(output)

  return archive.finalize()
}
