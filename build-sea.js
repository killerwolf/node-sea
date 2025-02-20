const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure required directories exist
const dirs = ['dist', 'dist/bundled', 'dist/sea'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// First, ensure the bundle exists
if (!fs.existsSync('./dist/bundled/bundle.js')) {
  console.error('Bundle not found. Please run npm run bundle first.');
  process.exit(1);
}

// Step 1: Generate the sea-prep.blob file
console.log('Generating sea-prep.blob...');
try {
  execSync('node --experimental-sea-config sea-config.json');
} catch (error) {
  console.error('Failed to generate sea-prep.blob:', error.message);
  process.exit(1);
}

// Step 2: Copy node binary
console.log('Copying node binary...');
try {
  const nodePath = execSync('command -v node').toString().trim();
  fs.copyFileSync(nodePath, 'hello');
} catch (error) {
  console.error('Failed to copy node binary:', error.message);
  process.exit(1);
}

// Step 3: Remove existing signature (macOS specific)
console.log('Removing existing signature...');
try {
  execSync('codesign --remove-signature hello');
} catch (error) {
  console.error('Failed to remove signature:', error.message);
  process.exit(1);
}

// Step 4: Inject the blob into the binary
console.log('Injecting SEA blob...');
try {
  execSync('npx --yes postject hello NODE_SEA_BLOB dist/sea/sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA');
} catch (error) {
  console.error('Failed to inject SEA blob:', error.message);
  process.exit(1);
}

// Step 5: Sign the binary (macOS specific)
console.log('Signing the binary...');
try {
  execSync('codesign --sign - hello');
} catch (error) {
  console.error('Failed to sign binary:', error.message);
  process.exit(1);
}

console.log('SEA binary creation complete! The executable is ready: ./hello');