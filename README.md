# Node.js Single Executable Application (SEA) Example

This project demonstrates how to create a Single Executable Application (SEA) using Node.js. SEAs allow you to bundle your Node.js application into a single binary executable, making it easier to distribute and run without requiring Node.js installation on the target machine. For more information about SEAs, see the [official Node.js documentation](https://nodejs.org/api/single-executable-applications.html).

> **Stability note:** SEA is still listed as *Experimental (1.1 – Active development)* in the Node.js docs, not Stable — treat it accordingly, even though it's functional enough for real use.

## Prerequisites

- Node.js **26** or later (see `.nvmrc`) — required for the one-step `node --build-sea` builder introduced in v25.5.0. It has **not** been backported to the Node 24 "Krypton" LTS line as of this writing; Node 26 becomes Active LTS in October 2026. If you're stuck on an older Node, see [Building on older Node versions](#building-on-older-node-versions) below.
- macOS, Windows, or Linux (any distro except Alpine; any arch except s390x). On macOS, only arm64 is officially tested by Node — x64 is not currently covered.
- npm (Node Package Manager)

## Project Structure

```
.
├── hello.ts                 # Main application entry point
├── lib/                    # Application modules
│   └── greeter.ts          # Example module
├── dist/                   # Build output directory
│   ├── bundled/           # Contains bundled application
│   ├── hello              # The final SEA executable
│   └── transpiled/        # Contains compiled TypeScript
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
   This script runs `node --build-sea sea-config.json`, which generates the blob, copies the Node.js binary, and injects the code in one step, then signs the result on macOS.

## Running the Application

After building, you'll find an executable named `hello` in the dist directory. You can run it with or without parameters:

```bash
./dist/hello FAF
Hello, FAF!
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
1. Runs `node --build-sea sea-config.json`, which generates the blob, copies the Node.js binary, and injects the code into it — all internally, using the same [LIEF](https://lief.re/)-based logic that used to live in the external `postject` tool (now folded into Node core and no longer needed as a dependency)
2. Signs the resulting binary (macOS specific)

`sea-config.json` also enables `useCodeCache`, which pre-compiles the bundle to V8 bytecode at build time for a faster cold start. Other options worth knowing about: `assets` (embed arbitrary files, read back via `node:sea`), `useSnapshot` (V8 heap snapshot for even faster startup), and `execArgv` (bake in default CLI flags).

#### Building on older Node versions

If you're on Node 24 LTS or earlier, `--build-sea` doesn't exist yet — use the legacy manual flow instead (blob generation + [`postject`](https://github.com/nodejs/postject) injection + codesign), as documented in the [Node.js SEA docs](https://nodejs.org/api/single-executable-applications.html) for your version. This repo only implements the modern one-step flow.

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

## Future Improvements

Here are some potential enhancements that could be implemented to improve the project:

1. **Automated Testing**
   - Add unit tests for core functionality using Jest or Mocha
   - Implement integration tests for the SEA build process
   - Add end-to-end testing for the executable
   - Set up test coverage reporting

2. **Continuous Integration/Deployment**
   - Set up GitLab CI/CD pipeline
   - Implement automated builds for different platforms
   - Add automated release management
   - Configure deployment workflows

3. **Code Quality**
   - Integrate Biome for code formatting and linting
   - Implement SonarQube for code quality metrics
   - Set up pre-commit hooks for code quality checks
   - Watch `ts-node` for TypeScript 7 (native Go compiler, GA July 2026) support before upgrading past TS 5.9 — TS 7 shipped without a stable programmatic API, which `ts-node` depends on

4. **Documentation**
   - Add JSDoc documentation for all functions
   - Generate API documentation
   - Create contribution guidelines
   - Add architecture diagrams

5. **Performance**
   - Implement build size optimization
   - Add performance benchmarking
   - Optimize startup time
   - Implement caching strategies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## References

- [Node.js Single Executable Applications Documentation](https://nodejs.org/api/single-executable-applications.html) - Official documentation for creating and working with SEAs