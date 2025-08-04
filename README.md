# Capture Lite

<a href='https://play.google.com/store/apps/details?id=io.numbersprotocol.capturelite'><img alt='Get it on Google Play' src='https://i.imgur.com/nqDY3fd.png' height="64"/></a>
<a href='https://apps.apple.com/tw/app/capture-app/id1536388009'><img alt='Get it on Google Play' src='https://i.imgur.com/OdHCgWO.png' height="64"/></a>

| branch  |                                                                                        build                                                                                         |                                                                                                                                        coverage                                                                                                                                         |                                                                                                                                      quality                                                                                                                                      |
| :-----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  main   |        [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade)         |
| develop | [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg?branch=develop)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild) | [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage) | [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade) |

## Getting Started

### Quick Setup with AI

For rapid development environment setup, use this prompt with Claude or other AI assistants:

```
I need to set up the development environment for the Numbers Protocol Capture Cam mobile app from scratch. This is an Angular/Ionic mobile application with the following requirements:

- Node.js v20.11.1+ (v20.11.1 or higher)
- NPM (comes with Node.js)
- Git for cloning the repository

Setup steps needed:
1. Clone the repository: git clone https://github.com/numbersprotocol/capture-lite.git
2. Navigate to project directory: cd capture-lite

**Important Note**: Some commands require environment-specific configurations and commercial package licenses that may not be available locally:

3. Install dependencies: npm install --legacy-peer-deps
   *Note: Requires commercial package authentication for some dependencies*
4. Start development server: npm run serve
   *Note: Limited functionality without full environment setup*
5. Run tests: npm run test
   *Note: Works with dependencies installed*
6. Run linting: npm run lint
   *Note: Works with dependencies installed*

**Alternative for environments without full setup:**
- Edit source code directly using your preferred IDE/editor
- Use GitHub Actions (Firebase Release) for testing with full dependencies
- Download builds via Firebase App Distribution for device testing

Please help me:
1. Verify/install the correct Node.js version (v20.11.1+)
2. Clone the repository and set up code editing environment
3. Understand the codebase structure for effective development
4. Guide me through the GitHub Actions testing workflow
5. Help me with specific development tasks I want to accomplish
```

### Manual Setup

Node.js v20.11.1+ is required (v20.11.1 or higher recommended).

Clone the repository:

```bash
git clone https://github.com/numbersprotocol/capture-lite.git
cd capture-lite
```

Install the dependencies:

```bash
npm install --legacy-peer-deps
# Note: Requires commercial package authentication
```

Start the development server:

```bash
npm run serve
# Note: Limited functionality without full environment setup
```

Run linting and tests:

```bash
npm run lint    # Requires dependencies installed
npm run test    # Requires dependencies installed
```

**Alternative Development Approach:**
If dependencies can't be installed due to missing environment variables, you can still:

- Edit source code directly using your IDE/editor
- Use GitHub Actions workflows for testing (see [Development Workflow](./DEPLOYMENT.md#development-workflow-overview))
- Test builds via Firebase App Distribution

## Development

### Common Commands

```bash
npm run serve      # Start development server
npm run test       # Run unit tests
npm run test.ci    # Run tests in headless mode
npm run lint       # Run linting (required before commit)
npm run build      # Build for production
```

### Platform Development

```bash
npm run build.android    # Build and sync for Android
npm run build.ios        # Build and sync for iOS
npx cap open android     # Open in Android Studio
npx cap open ios         # Open in Xcode
```

### Contribution

- Run `npm run lint` before each commit.
- The committed codes should pass all GitHub checks.
- Use [Visual Studio Code](https://code.visualstudio.com/) with workspace settings for consistent coding style.
- Use [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to auto format on save.
- Prefer `Promise` than `Observable` when only emitting one value. See [issue #233](https://github.com/numbersprotocol/capture-lite/issues/233).
- Avoid using `toPromise()` to convert `Observable` to `Promise` as [it is an anti-pattern](https://stackoverflow.com/a/49596716/8789738).

### Platform

#### Android

If your operating system is Linux, set the environment variable `CAPACITOR_ANDROID_STUDIO_PATH` for your Android Studio. The default value is `/usr/local/android-studio/bin/studio.sh`.

```sh
export CAPACITOR_ANDROID_STUDIO_PATH="/home/username/android-studio/bin/studio.sh"
```

Before running the app with Android Studio, build and sync the dependencies and web assets.

```bash
npm run build
npx cap sync android
```

Open the project in Android Studio.

```bash
npx cap open android
```

The script does the same thing for you.

```bash
npm run build.android
```

### Caveat

- This app is still in the experimental stage.
- This app uses raw file system to save proofs, and thus the performance is not optimized.

## Development & Deployment Workflow

Due to local environment limitations, the recommended development flow uses GitHub Actions for testing:

### Development Testing

1. **Make code changes** and ensure local build/tests pass
2. **Deploy for testing** using GitHub Actions:
   - **Android APK Build**: For Android device testing
   - **Firebase Release**: For distributing to test groups (Android & iOS)
3. **Test your implementation** using the deployed build
4. **Request code review** from senior developers after confirming changes work

### QA/Production Deployment

After code review approval:

1. Bump version numbers (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. Trigger pre-release GitHub Action for Play Store (alpha) and TestFlight
3. QA team handles promotion to production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
