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
  console.error(`node --build-sea requires Node.js 25.5+ — you are running ${process.version}.`);
  console.error('As of this writing it only ships on the Node 26 "Current" release line (not yet backported to the 24 LTS line). Switch with: nvm install 26 && nvm use 26');
  process.exit(1);
}

// Step 2: sea-config.json's "output" is a plain "dist/hello" with no
// extension. On Windows that isn't directly runnable -- the file itself is
// still a valid PE binary (it started as a copy of node.exe), so a plain
// rename to add .exe is enough; no need to rebuild anything.
let outputPath = 'dist/hello';
if (process.platform === 'win32') {
  const exePath = 'dist/hello.exe';
  fs.renameSync(outputPath, exePath);
  outputPath = exePath;
}

// Step 3: Sign the binary (macOS specific; required for the binary to run
// without a Gatekeeper prompt on Apple Silicon)
if (process.platform === 'darwin') {
  console.log('Signing the binary (macOS ad-hoc signature)...');
  try {
    execSync(`codesign --sign - ${outputPath}`);
  } catch (error) {
    console.error('Failed to sign binary:', error.message);
    process.exit(1);
  }
} else if (process.platform === 'win32') {
  console.log(`On Windows, sign ${outputPath} yourself if you need a trusted binary:`);
  console.log(`  signtool sign /fd SHA256 ${outputPath}`);
}

console.log(`SEA binary creation complete! The executable is ready: ./${outputPath}`);
