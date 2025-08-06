# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **capture-lite** repository - an Angular/Ionic mobile application that serves as the Capture Cam mobile app for creator-focused content monetization. It's a mobile app that runs on iOS and Android platforms, built with Angular 14, Ionic 6, and Capacitor 7.

The app enables users to capture media with provenance tracking, connect to blockchain networks for content verification, and manage digital assets with built-in cryptocurrency wallet functionality.

## Development Commands

### Setup and Development

```bash
npm install --legacy-peer-deps  # Install dependencies (required for compatibility)
npm run serve                   # Start development server (includes preconfig)
npm run serve.prod             # Start dev server with production config
```

### Building

```bash
npm run build                   # Build for production (includes preconfig)
npm run build.android          # Build and sync for Android
npm run build.ios             # Build and sync for iOS
```

### Testing and Quality

```bash
npm run test                    # Run unit tests with Karma/Jasmine
npm run test.ci                # Run tests in headless CI mode
npm run lint                    # Run linting (Prettier, Stylelint, ESLint)
```

### Platform-Specific Commands

```bash
npx cap sync android           # Sync web assets to Android
npx cap sync ios              # Sync web assets to iOS
npx cap open android          # Open project in Android Studio
npx cap open ios              # Open project in Xcode
```

## Architecture Overview

### Core Technology Stack

- **Frontend Framework**: Angular 14 with TypeScript
- **Mobile Framework**: Ionic 6 with Capacitor 7
- **State Management**: NgRx Store for component state
- **UI Components**: Angular Material + Ionic components
- **Internationalization**: Transloco for multi-language support
- **Testing**: Karma/Jasmine (unit tests)

### Application Structure

#### Feature Modules (Lazy-loaded)

- **home/**: Main application interface with capture, collection, and post-capture tabs
- **login/signup/**: Authentication flows with social login support
- **settings/**: User preferences, email verification, GoPro integration
- **wallets/**: Cryptocurrency wallet management and NUM token transfers
- **contacts/**: Friend management and sharing functionality
- **activities/**: Transaction history and capture details

#### Shared Services Architecture

- **dia-backend/**: Backend API integration services
  - Asset management (uploading, downloading, prefetching)
  - Authentication and user management
  - Blockchain transaction handling
  - Series and workflow management
- **capture/**: Core media capture and proof generation
- **collector/**: Metadata collection with facts and signature providers
- **database/**: Local storage abstraction using Capacitor filesystem
- **camera/**: Capacitor camera integration
- **media/**: Media display and storage management

### Data Flow Pattern

1. **Media Capture**: Camera service → Capture service → Proof generation
2. **Backend Sync**: Local storage → DIA Backend services → Blockchain
3. **State Management**: Services → NgRx store → Components
4. **Cross-platform**: Capacitor plugins → Native device APIs

## Configuration Files

- **capacitor.config.json**: Native app configuration and plugin settings
- **ionic.config.json**: Ionic CLI configuration
- **angular.json**: Angular build and test configurations
- **environments/**: Environment-specific configurations

## Testing Strategy

### Unit Testing

- **Framework**: Karma + Jasmine with ChromeHeadless
- **Coverage**: Cobertura reports generated
- **Mock Services**: Comprehensive mocking in `shared/capacitor-plugins/`
- **Testing Modules**: Separate testing modules for shared functionality

## Key Development Patterns

### Service Organization

- **Repository Pattern**: Data access abstraction (e.g., ProofRepository)
- **Provider Pattern**: Pluggable implementations (FactsProvider, SignatureProvider)
- **Backend Abstraction**: DIA Backend services centralize API calls
- **Preference Management**: Unified settings storage with Capacitor Preferences

### Component Architecture

- **Feature-based Modules**: Each feature has its own routing and module
- **Shared Components**: Reusable UI components in shared/
- **Tab-based Navigation**: Main interface uses Ionic tabs
- **Modal Dialogs**: Angular Material dialogs for overlays

### Mobile-First Considerations

- **Capacitor Integration**: Native device APIs through plugins
- **Platform Detection**: Android-specific behavior handling
- **Offline Support**: Local database with sync capabilities
- **Performance**: Lazy loading modules and asset optimization

## Code Quality Standards

### Linting and Formatting

- **Prettier**: Code formatting with pre-commit hooks
- **ESLint**: Angular-specific linting rules
- **Stylelint**: SCSS/CSS linting
- **Husky**: Git hooks for automated quality checks

### TypeScript Configuration

- **Strict Mode**: Enabled with strict injection parameters
- **Path Mapping**: Browser API polyfills configured
- **Module Resolution**: Node.js-style resolution

### Development Guidelines

- Prefer Promise over Observable for single-value emissions
- Avoid `toPromise()` conversion (use `firstValueFrom` instead)
- Use Visual Studio Code with Prettier extension
- Run `npm run lint` before commits
- Maintain comprehensive test coverage
- **Platform Detection**: Use `Platform.is('ios')` from `@ionic/angular` instead of `Capacitor.getPlatform() === 'ios'` for better Ionic integration and consistency

This mobile application combines modern web technologies with native mobile capabilities to create a content authenticity and blockchain integration platform.
