const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['hello.ts'],
  bundle: true,
  outfile: 'dist/bundled/bundle.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  sourcemap: true,
  minify: true,
}).catch(() => process.exit(1));