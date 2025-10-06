import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { dts } from 'rollup-plugin-dts';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.ROLLUP_WATCH;

// 读取 package.json 版本号用于构建时注入
const pkgJsonPath = resolve(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
const buildVersion = pkg.version || '0.0.0';

const sharedPlugins = [
  replace({ 
    preventAssignment: true, 
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    __VERSION__: JSON.stringify(buildVersion)
  }),
  alias({
    entries: [
      { find: '@', replacement: resolve(__dirname, 'src') }
    ]
  }),
  nodeResolve({ 
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  typescript({ 
    tsconfig: './tsconfig.json', 
    exclude: ['**/demo/**', '**/*.test.*'] 
  }),
  babel({ 
    extensions: ['.ts'], 
    babelHelpers: 'bundled',
    presets: [
      ['@babel/preset-env', { targets: { browsers: ['> 1%', 'last 2 versions'] } }]
    ],
    exclude: 'node_modules/**'
  })
];

if (isDev) {
  sharedPlugins.push(
    serve({ 
      contentBase: '.', 
      port: 8080, 
      openPage: '/demo/index.html' 
    }),
    livereload({ watch: ['dist', 'demo'] })
  );
}

export default [
  // 主库：ESM + UMD
  {
    input: 'src/index.ts',
    output: [
      { 
        file: 'dist/ebin-player.esm.js', 
        format: 'es',
        sourcemap: isDev
      },
      { 
        file: 'dist/ebin-player.umd.js', 
        format: 'umd', 
        name: 'EbinPlayer',
        sourcemap: isDev
      }
    ],
    plugins: sharedPlugins
  },
  // 类型声明
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/ebin-player.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];