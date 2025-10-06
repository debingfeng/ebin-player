import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';

const isDev = process.env.ROLLUP_WATCH;

const sharedPlugins = [
  replace({ preventAssignment: true, 'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production') }),
  nodeResolve({ browser: true }),
  commonjs(),
  typescript({ tsconfig: './tsconfig.json', exclude: ['**/demo/**'] }),
  babel({ extensions: ['.ts', '.tsx'], babelHelpers: 'bundled', presets: [['@babel/preset-react', { runtime: 'automatic' }], ['@babel/preset-env']] })
];

if (isDev) {
  sharedPlugins.push(
    serve({ contentBase: '.', port: 8080, openPage: '/src/demo/index.html' }),
    livereload({ watch: ['dist', 'src/demo'] })
  );
}

export default [
  // 主库：ESM + UMD
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/web-player.esm.js', format: 'es' },
      { file: 'dist/web-player.umd.js', format: 'umd', name: 'WebPlayer', globals: { react: 'React' } }
    ],
    external: ['react'],
    plugins: sharedPlugins
  },
  // 类型声明
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/web-player.d.ts', format: 'es' }],
    plugins: [dts()]
  },
  // Demo
  {
    input: 'src/demo/main.ts',
    output: { file: 'dist/demo.js', format: 'iife' },
    plugins: sharedPlugins.filter(p => !['rollup-plugin-serve', 'rollup-plugin-livereload'].includes(p.name))
  }
];