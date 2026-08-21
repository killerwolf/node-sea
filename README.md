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
│   ├── greeter.ts          # Example module
│   └── greeter.test.ts     # Tests (node:test)
├── assets/                 # Files embedded into the binary via sea-config.json
│   └── greeting.txt
├── dist/                   # Build output directory
│   ├── bundled/           # Contains bundled application
│   ├── hello              # The final SEA executable (hello.exe on Windows)
│   └── transpiled/        # Contains compiled TypeScript
├── .github/workflows/ci.yml # Lint + cross-platform build matrix
├── build-bundle.js         # esbuild bundling script
├── build-sea.js           # SEA creation script
├── sea-config.json        # SEA configuration
├── biome.json              # Lint/format config
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
This message was bundled directly into the binary via sea-config.json's "assets" field — no external file was shipped alongside the executable to read it from.
```

This binary contains everything needed to run your application, including the Node.js runtime. The second line comes from `assets/greeting.txt`, embedded at build time and read back via `node:sea` — see below.

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

`sea-config.json` also enables `useCodeCache`, which pre-compiles the bundle to V8 bytecode at build time for a faster cold start, and demonstrates `assets`: `assets/greeting.txt` is embedded into the binary at build time and read back at runtime in `hello.ts` via `node:sea`'s `isSea()` / `getAsset()`. It only prints when actually running as a SEA — `npm start` (plain ts-node, not a SEA) skips it. Another option worth knowing about: `useSnapshot` (V8 heap snapshot for even faster startup — not used here, since it requires restructuring the entry point around `v8.startupSnapshot`) and `execArgv` (bake in default CLI flags).

#### Building on older Node versions

If you're on Node 24 LTS or earlier, `--build-sea` doesn't exist yet — use the legacy manual flow instead (blob generation + [`postject`](https://github.com/nodejs/postject) injection + codesign), as documented in the [Node.js SEA docs](https://nodejs.org/api/single-executable-applications.html) for your version. This repo only implements the modern one-step flow.

## Customizing the Project

1. Modify `hello.ts` and files in `lib/` for your application logic
2. Update `sea-config.json` if you change the entry point
3. Adjust `build-bundle.js` for different bundling options
4. Modify `build-sea.js` for platform-specific requirements

## Notes

- The SEA binary is platform-specific; you'll need to build it on each target platform. CI builds and smoke-tests it on Linux, macOS, and Windows on every push/PR (see `.github/workflows/ci.yml`).
- Source maps are included for debugging, but not used in the final SEA

## License

ISC

## Future Improvements

Done so far: unit tests (`node:test`), CI with a cross-platform build matrix (GitHub Actions), and linting/formatting (Biome). Still open:

1. **Testing**
   - Integration/end-to-end tests for the built binary itself, beyond the CI smoke test
   - Test coverage reporting

2. **Release automation**
   - Automated release management (tag → build matrix → attach binaries to a GitHub Release)

3. **Code Quality**
   - Watch `ts-node` for TypeScript 7 (native Go compiler, GA July 2026) support before upgrading past TS 5.9 — TS 7 shipped without a stable programmatic API, which `ts-node` depends on
   - Pre-commit hooks (e.g. via Biome's own git hooks support)

4. **Documentation**
   - Add JSDoc documentation for all functions
   - Create contribution guidelines

5. **Performance**
   - Add performance/startup-time benchmarking
   - Consider `useSnapshot` for faster cold starts (see `sea-config.json` discussion above)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## References

- [Node.js Single Executable Applications Documentation](https://nodejs.org/api/single-executable-applications.html) - Official documentation for creating and working with SEAs