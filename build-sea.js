const { execSync } = require('child_process');
const fs = require('fs');

// Ensure the bundle exists
if (!fs.existsSync('./dist/bundled/bundle.js')) {
  console.error('Bundle not found. Please run npm run build:bundle first.');
  process.exit(1);
}

fs.mkdirSync('dist', { recursive: true });

// Step 1: Build the SEA binary in one shot (blob generation + node binary
// copy + injection are all handled internally since Node.js v25.5.0).
console.log('Building SEA binary (node --build-sea)...');
try {
  execSync('node --build-sea sea-config.json', { stdio: 'inherit' });
} catch (error) {
  console.error('\nFailed to build the SEA binary.');
  console.error(`node --build-sea requires Node.js 24 "Krypton" LTS or newer — you are running ${process.version}.`);
  console.error('Switch with: nvm install lts/krypton && nvm use lts/krypton');
  process.exit(1);
}

// Step 2: Sign the binary (macOS specific; required for the binary to run
// without a Gatekeeper prompt on Apple Silicon)
if (process.platform === 'darwin') {
  console.log('Signing the binary (macOS ad-hoc signature)...');
  try {
    execSync('codesign --sign - dist/hello');
  } catch (error) {
    console.error('Failed to sign binary:', error.message);
    process.exit(1);
  }
} else if (process.platform === 'win32') {
  console.log('On Windows, sign dist/hello.exe yourself if you need a trusted binary:');
  console.log('  signtool sign /fd SHA256 dist\\hello.exe');
}

console.log('SEA binary creation complete! The executable is ready: ./dist/hello');
