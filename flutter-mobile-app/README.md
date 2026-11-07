# 📱 APKStore - Official Flutter Android Client

A modern Android APK Store & Package Manager built with **Flutter**, featuring direct 1-click in-app APK download & installation.

---

## 🎨 Theme & Features
- **Branded UI**: Cyber Dark Theme (`#080C16`) with Neon Green (`#00E676`) accents.
- **Official Logo**: Embedded robot crate icon (`assets/images/logo.webp`).
- **Verified Badges**: Blue verified package badges and 100% Virus Free shield indicators.
- **Direct 1-Click Install**: Downloads the APK package with real-time percentage progress and launches the native Android package installer dialog.
- **Cloud Backend Sync**: Pre-configured to connect directly to the live production server `https://apkvault-store.vercel.app`.

---

## 🚀 How to Run & Build

### 1. Run on Device / Emulator:
```bash
cd flutter-mobile-app
flutter pub get
flutter run
```

### 2. Build Release APK:
```bash
flutter build apk --release
```
The output APK will be generated at:
`build/app/outputs/flutter-apk/app-release.apk`
