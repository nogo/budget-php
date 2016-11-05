import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/frontend/js/main.js',
  dest: 'public/js/bundle.js',
  format: 'umd',
  moduleName: 'budget',
  sourceMap: true,
  plugins: [
    json(),
    nodeResolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}
