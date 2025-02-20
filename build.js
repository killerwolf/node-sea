const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['hello.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  sourcemap: true,
  minify: true,
  //external: ['commander'],  // External dependencies that should not be bundled
}).catch(() => process.exit(1));