# Deployment Guide

This document provides step-by-step instructions for the development and deployment workflow for the Capture Cam app.

## Development Workflow Overview

Due to local environment limitations (missing environment-specific configurations), the recommended development flow is:

1. **Develop & Test Locally**: Make code changes, ensure build and tests pass
2. **Deploy for Testing**: Use GitHub Actions to build and test your changes
3. **Verify Implementation**: Test the actual app functionality through deployed builds
4. **Code Review**: Request senior developer review after confirming changes work as expected
5. **Release**: Proceed to QA/production deployment after approval

## Available Deployment Options

The app supports three GitHub Action deployment types:

- **Android APK Build**: Generate APK files for direct installation and testing
- **Firebase Release**: Distribute Android AAB and iOS IPA to test groups via Firebase App Distribution
- **Pre-release (Store Release)**: Deploy to Google Play Store (alpha) and Apple TestFlight (for official QA/production only)

## Development Testing Deployment

### Step 1: Choose Your Testing Method

**For Feature Development & Bug Fixes:**

- **Android APK Build**: Best for quick Android testing with APK files
- **Firebase Release**: Best for distributing to test groups (both Android AAB and iOS IPA)

**Recommendation**: Use **Firebase Release** for most development testing as it provides both Android and iOS builds distributed to your test groups with full environment configuration.

### Step 2: Trigger GitHub Action for Development Testing

**For Android APK Build:**

1. **Commit, Push, and Create PR**:

   ```bash
   git add .
   git commit -m "feat: implement [your feature description]"
   git push origin [your-feature-branch]
   ```

   - Create a Pull Request on GitHub

2. **Trigger via GitHub Actions UI**:
   - Visit [GitHub Actions tab](https://github.com/numbersprotocol/capture-lite/actions)
   - Select "Build APKs" workflow
   - Click "Run workflow", select your branch
   - Optionally add a description and click "Run workflow"

**For Firebase Release:**

1. **Increment Android Version Code** (if building Android):

   ```gradle
   // In android/app/build.gradle - only needed if building Android
   android {
       defaultConfig {
           versionCode 1011  // e.g., 1010 → 1011 (small increment for testing)
           versionName "0.101.0"  // Keep current version
       }
   }
   ```

2. **Commit, Push, and Create PR**:

   ```bash
   git add android/app/build.gradle  # only if modified
   git commit -m "chore: increment versionCode for Firebase testing"
   git push origin [your-feature-branch]
   ```

   - Create a Pull Request on GitHub (if not already created)

3. **Trigger via GitHub Actions UI**:
   - Visit [GitHub Actions tab](https://github.com/numbersprotocol/capture-lite/actions)
   - Select "firebase-release" workflow
   - Click "Run workflow", select your branch
   - Choose platforms: Check "Build Android" and/or "Build iOS" (both selected by default)
   - Optionally add a description and click "Run workflow"

**Note**: Firebase Release automatically handles iOS versioning with timestamps, but Android uses the static `versionCode` from gradle file.

### Step 3: Test Your Implementation

**Android APK Build:**

- Download the generated APK from the GitHub Actions artifacts
- Install on Android device/emulator for testing
- Verify your feature/fix works as expected

**Firebase Release:**

- Builds are automatically distributed to Firebase App Distribution test groups
- Testers receive notifications to download Android AAB and iOS IPA files
- Test on both Android and iOS devices with full functionality
- Access through Firebase App Distribution app or email links

### Step 4: Code Review Process

Once you've verified your changes work correctly:

**Add senior developers as reviewers** to your existing Pull Request

## QA/Production Deployment

After code review approval, proceed with official QA deployment:

### Step 1: Bump Version Numbers

**Important**: Always bump the version before deployment to ensure users can see the new version.

You need to update **4 files** with the new version number:

#### 1. Update package.json

```json
{
  "version": "0.102.0"
}
```

#### 2. Update Android version in android/app/build.gradle

```gradle
android {
    defaultConfig {
        versionCode 1020  // e.g., 1010 → 1020
        versionName "0.102.0"  // e.g., 0.101.0 → 0.102.0
    }
}
```

#### 3. Update iOS version in ios/App/App.xcodeproj/project.pbxproj

Update both occurrences of:

```
CURRENT_PROJECT_VERSION = 1020;  // e.g., 1010 → 1020
MARKETING_VERSION = 0.102.0;     // e.g., 0.101.0 → 0.102.0
```

#### 4. Update CHANGELOG.md

Add a new release section with:

- Release date
- Added features
- Changed functionality
- Fixed bugs
- Update the comparison links at the bottom

#### 5. Update package-lock.json

```bash
npm install --legacy-peer-deps
```

**Version Number Guidelines:**

- **Major (X)**: Breaking changes or major new features
- **Minor (Y)**: New features, backwards compatible
- **Patch (Z)**: Bug fixes, small improvements
- **versionCode/CURRENT_PROJECT_VERSION**: Follow the established pattern (e.g., 1000 → 1010 → 1020)

### Step 2: Commit Version Changes

```bash
git add package.json android/app/build.gradle ios/App/App.xcodeproj/project.pbxproj CHANGELOG.md package-lock.json
git commit -m "chore: bump app version to 0.102.0"
git push origin [your-branch]
```

### Step 3: Trigger Pre-release for Official QA

1. Go to the [GitHub Actions tab](https://github.com/numbersprotocol/capture-lite/actions)
2. Find the **pre-release** workflow
3. Click "Run workflow"
4. Select the branch with your changes
5. Click "Run workflow" to trigger the build

The GitHub Action will automatically:

- Build the app for both iOS and Android
- Deploy to Google Play Store (alpha track for QA testing)
- Deploy to Apple TestFlight (for QA testing)

### Step 4: Verify Deployment and Testing

**Google Play Store (Android):**

- Check the [Google Play Console](https://play.google.com/console)
- Verify the new version appears in the alpha track
- Test with QA team members who have access to alpha testing

**Apple TestFlight (iOS):**

- Check [App Store Connect](https://appstoreconnect.apple.com)
- Verify the new build appears in TestFlight
- Share with internal testers for QA validation

### Step 5: Production Release (QA Team Action)

Once the QA team completes testing and approves the build:

**Google Play Store:**

- QA team promotes the alpha version to production track directly in Play Console
- No additional developer action required

**Apple App Store:**

- QA team submits the TestFlight build for App Store review
- Apple reviews and releases to production
- No additional developer action required

## Troubleshooting

### Common Issues

**Build Fails:**

- Check GitHub Actions logs for detailed error messages
- Ensure all tests pass locally before triggering deployment
- Verify version numbers are properly incremented

**Version Conflicts:**

- Ensure versionCode in Android gradle file is always incremented
- Check that version numbers match between package.json and build.gradle

**Deployment Not Appearing:**

- Allow 15-30 minutes for builds to complete
- Check that you have proper access to Play Console and App Store Connect
- Verify the correct branch/tag was used for deployment

### Getting Help

1. Check the [GitHub Actions logs](https://github.com/numbersprotocol/capture-lite/actions) for detailed error messages
2. Contact the development team if issues persist

## Best Practices

- **Always test locally** before triggering QA deployment
- **Run linting** (`npm run lint`) before committing
- **Increment version numbers** for every deployment
- **Test on QA environments** before production release
- **Update CHANGELOG.md** for production releases
- **Coordinate with team** for production deployments to avoid conflicts
