# Capture Lite - GitHub Copilot Instructions

## Project Overview

This is the **capture-lite** repository - an Angular/Ionic mobile application that serves as the Capture Cam mobile app for creator-focused content monetization. It's a cross-platform mobile app (iOS and Android) built with Angular 14, Ionic 6, and Capacitor 7.

The app enables users to capture media with provenance tracking, connect to blockchain networks for content verification, and manage digital assets with built-in cryptocurrency wallet functionality.

## Technology Stack

- **Frontend Framework**: Angular 14 with TypeScript
- **Mobile Framework**: Ionic 6 with Capacitor 7
- **State Management**: NgRx Store
- **UI Components**: Angular Material + Ionic components
- **Internationalization**: Transloco
- **Testing**: Karma/Jasmine (unit tests)
- **Build System**: Angular CLI with Ionic CLI
- **Package Manager**: NPM with `--legacy-peer-deps` flag required

## Project Structure

### Core Directories

- `src/app/features/`: Feature modules (lazy-loaded) - home, login, settings, wallets, contacts, activities
- `src/app/shared/`: Shared services, components, and utilities
- `src/assets/`: Static assets including fonts, i18n files, and images
- `src/environments/`: Environment-specific configurations
- `android/`: Android platform files (Capacitor)
- `ios/`: iOS platform files (Capacitor)

### Key Services Architecture

- `shared/dia-backend/`: Backend API integration services
- `shared/capture/`: Core media capture and proof generation
- `shared/collector/`: Metadata collection with facts and signature providers
- `shared/database/`: Local storage abstraction using Capacitor filesystem
- `shared/camera/`: Capacitor camera integration
- `shared/media/`: Media display and storage management

## Development Commands

### Setup and Development

```bash
npm install --legacy-peer-deps  # Required for dependency compatibility
npm run serve                   # Start development server
npm run serve.prod             # Start dev server with production config
```

### Building

```bash
npm run build                   # Build for production
npm run build.android          # Build and sync for Android
npm run build.ios             # Build and sync for iOS
```

### Testing and Quality

```bash
npm run test                    # Run unit tests
npm run test.ci                # Run tests in headless CI mode
npm run lint                    # Run linting (required before commit)
```

### Platform Commands

```bash
npx cap sync android           # Sync web assets to Android
npx cap sync ios              # Sync web assets to iOS
npx cap open android          # Open in Android Studio
npx cap open ios              # Open in Xcode
```

## Development Guidelines

### Code Quality Standards

- Always run `npm run lint` before committing
- Use Prettier for code formatting (configured with pre-commit hooks)
- Follow Angular style guide and conventions
- Maintain comprehensive test coverage with Karma/Jasmine
- Use Visual Studio Code with Prettier extension enabled

### TypeScript Patterns

- Prefer `Promise` over `Observable` for single-value emissions
- Avoid `toPromise()` - use `firstValueFrom()` instead
- Use strict TypeScript configuration
- Implement proper type safety throughout

### Architecture Patterns

- **Feature Modules**: Organize code by features with lazy loading
- **Repository Pattern**: Use for data access abstraction
- **Provider Pattern**: Implement pluggable components (FactsProvider, SignatureProvider)
- **Service Layer**: Centralize business logic in services
- **Component Architecture**: Feature-based modules with shared components

### Mobile Development Considerations

- Use Capacitor plugins for native device APIs
- Handle platform-specific behavior (especially Android)
- Implement offline support with local database sync
- Optimize performance with lazy loading and asset optimization
- Follow mobile-first responsive design principles
- **Platform Detection**: Use `Platform.is('ios')` from `@ionic/angular` instead of `Capacitor.getPlatform() === 'ios'` for better Ionic integration and consistency

## Configuration Files

- `capacitor.config.json`: Native app configuration and plugin settings
- `ionic.config.json`: Ionic CLI configuration
- `angular.json`: Angular build and test configurations
- `package.json`: Dependencies and scripts
- Environment files in `src/environments/`

## Testing Strategy

- Unit tests with Karma + Jasmine + ChromeHeadless
- Mock services available in `shared/capacitor-plugins/`
- Separate testing modules for shared functionality
- CI/CD integration with GitHub Actions

## Deployment Notes

- Local development has limited functionality due to missing environment configs
- Use GitHub Actions for full testing (Android APK Build, Firebase Release)
- Development workflow: Local changes → GitHub Actions deployment → Device testing
- Production releases managed through Play Store (alpha) and TestFlight

## Common Issues

- Always use `npm install --legacy-peer-deps` for dependency installation
- Environment-specific configurations may cause local limitations
- Performance considerations due to raw file system usage for proofs
- Platform-specific setup required for Android Studio path on Linux

## Key Dependencies

- Angular 14, Ionic 6, Capacitor 7
- NgRx for state management
- Angular Material for UI components
- Transloco for internationalization
- Various Capacitor plugins for native functionality
