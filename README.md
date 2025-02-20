# Node.js Single Executable Application (SEA) Example

This project demonstrates how to create a Single Executable Application (SEA) using Node.js. SEAs allow you to bundle your Node.js application into a single binary executable, making it easier to distribute and run without requiring Node.js installation on the target machine.

## Prerequisites

- Node.js (v16 or later)
- macOS (for this specific example; SEA supports other platforms with slight modifications)
- npm (Node Package Manager)

## Project Structure

```
.
├── hello.ts                 # Main application entry point
├── lib/                    # Application modules
│   └── greeter.ts          # Example module
├── build-bundle.js         # esbuild bundling script
├── build-sea.js           # SEA creation script
├── sea-config.json        # SEA configuration
└── tsconfig.json          # TypeScript configuration
```

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd node-sea
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. The project uses TypeScript for type safety. The main application code is in `hello.ts`.

2. To run the application in development mode:
   ```bash
   npm start
   ```

## Building the SEA

The build process consists of several steps, all automated through npm scripts:

1. Clean the previous build:
   ```bash
   npm run clean
   ```

2. Build everything in one go:
   ```bash
   npm run build:all
   ```

Or, you can run each step individually:

### Step-by-Step Build Process

1. Compile TypeScript:
   ```bash
   npm run build:js
   ```
   This compiles TypeScript files to JavaScript in the `dist/transpiled` directory.

2. Bundle the application:
   ```bash
   npm run build:bundle
   ```
   This uses esbuild to bundle all dependencies into a single file at `dist/bundled/bundle.js`.

3. Create the SEA binary:
   ```bash
   npm run build:sea
   ```
   This script:
   - Generates the SEA preparation blob
   - Copies the Node.js binary
   - Injects the application code
   - Signs the binary (macOS specific)

## Running the Application

After building, you'll find an executable named `hello` in the project root:

```bash
./hello
```

This binary contains everything needed to run your application, including the Node.js runtime.

## How It Works

### 1. TypeScript Compilation
The project uses TypeScript for type safety. The `tsconfig.json` configures the compilation process, outputting to `dist/transpiled`.

### 2. Bundling
The `build-bundle.js` script uses esbuild to:
- Bundle all dependencies
- Minify the code
- Generate source maps
- Output a single file in CommonJS format

### 3. SEA Creation
The `build-sea.js` script handles the SEA creation process:
1. Generates a preparation blob using `sea-config.json`
2. Copies the Node.js binary
3. Removes existing signatures (macOS specific)
4. Injects the application code into the binary
5. Signs the resulting binary (macOS specific)

## Customizing the Project

1. Modify `hello.ts` and files in `lib/` for your application logic
2. Update `sea-config.json` if you change the entry point
3. Adjust `build-bundle.js` for different bundling options
4. Modify `build-sea.js` for platform-specific requirements

## Notes

- The SEA binary is platform-specific; you'll need to build it on each target platform
- Source maps are included for debugging, but not used in the final SEA
- The build process is optimized for macOS but can be adapted for other platforms

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.