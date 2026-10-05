# Calm Online - Financial OS

Calm Online is a complete Business & Personal Financial Operating System with real-time Firebase sync, offline PWA capabilities, and native Android APK support via Capacitor.

---

## 🚀 Features

- **Personal & Business Separation**: Distinct ledger tracking, job costing, and expense management.
- **Weekly Closing Cycle**: Multi-step disciplined financial ritual for reconciliation and profit distributions.
- **Worker & Contractor Settlements**: Track advances, completed tasks, and payouts.
- **Firebase Firestore Integration**: Real-time cloud sync with offline persistence.
- **PWA & Offline-First**: Works 100% offline with Service Worker caching.
- **Android APK Ready**: Pre-configured Capacitor Android native project.

---

## 🛠️ Getting Started on Your PC (VS Code)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 How to Build the Offline Android APK (.apk)

The repository comes pre-configured with Capacitor and the native `android/` directory.

### Step 1: Build the Web Assets & Sync
```bash
npm run build
npx cap sync
```

### Step 2: Build the APK

#### Option A: Using Android Studio (Visual & Easiest)
1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
2. Wait for Gradle to finish syncing.
3. In the top menu, click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. When finished, Android Studio will display a popup: click **locate** to get `app-debug.apk`.

#### Option B: Directly from the VS Code Terminal
Ensure JDK 17+ and Android SDK are installed, then run:

**On Windows (PowerShell/CMD):**
```cmd
cd android
.\gradlew.bat assembleDebug
```

**On Mac / Linux:**
```bash
cd android
./gradlew assembleDebug
```

The generated APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Install on Android Phone via USB

1. Connect your Android phone to your PC via a USB cable.
2. Select **File Transfer / MTP** on your phone's USB notification.
3. Copy `app-debug.apk` to your phone's **Download** folder.
4. On your phone, open your **Files** app, tap `app-debug.apk`, and tap **Install**.
