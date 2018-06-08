import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

const PACKAGE_NAME = process.env.PACKAGE_NAME
const ENTRY_FILE = "./src/Swipeable.js"
const OUTPUT_DIR = "./dist"
const EXTERNAL = ['react-spring', 'react']
const GLOBALS = {
  react: 'React'
}

const isExternal = id => !id.startsWith('.') && !id.startsWith('/')

export default [
  {
    input: ENTRY_FILE,
    output: {
      file: `${OUTPUT_DIR}/${PACKAGE_NAME}.umd.js`,
      format: 'umd',
      name: PACKAGE_NAME,
      globals: GLOBALS,
    },
    external: EXTERNAL,
    plugins: [
      resolve(),
      babel(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },

  {
    input: ENTRY_FILE,
    output: {
      file: `${OUTPUT_DIR}/${PACKAGE_NAME}.min.js`,
      format: 'umd',
      name: PACKAGE_NAME,
      globals: GLOBALS,
    },
    external: EXTERNAL,
    plugins: [
      resolve(),
      babel(),
      commonjs(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      uglify(),
    ],
  },

  {
    input: ENTRY_FILE,
    output: {
      file: `${OUTPUT_DIR}/${PACKAGE_NAME}.cjs.js`,
      format: 'cjs',
    },
    external: isExternal,
    plugins: [babel()],
  },

  {
    input: ENTRY_FILE,
    output: {
      file: `${OUTPUT_DIR}/${PACKAGE_NAME}.esm.js`,
      format: 'es',
    },
    external: isExternal,
    plugins: [babel()],
  },
]
