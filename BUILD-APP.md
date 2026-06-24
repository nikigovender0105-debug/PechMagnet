# Pech-Magnet als App (Android & iOS) bauen

Das Spiel (`pechmagnet.html`) wird mit **Capacitor** in eine native App verpackt.
Eine Codebasis → **Android** *und* **iOS**.

---

## 1. Voraussetzungen (einmalig)

- **Node.js** (LTS) – https://nodejs.org
- **Android:** **Android Studio** (Windows/macOS/Linux) inkl. Android SDK
- **iOS:** zwingend ein **Mac mit Xcode** (App-Store-Apps lassen sich nur auf macOS bauen)

---

## 2. Projekt einrichten (einmalig)

Im Projektordner (wo `package.json` liegt):

```bash
npm install            # Capacitor installieren
npm run build          # erzeugt www/index.html aus pechmagnet.html
npx cap add android    # legt das Android-Projekt an
npx cap add ios        # legt das iOS-Projekt an (nur auf dem Mac nötig)
```

---

## 3. Android-App bauen

```bash
npm run open:android   # baut www, synct und öffnet Android Studio
```

In **Android Studio**:
- **Run ▶** auf einem Emulator/Gerät zum Testen, **oder**
- **Build → Build Bundle(s)/APK(s) → Build APK(s)** für eine APK, **oder**
- **Build → Generate Signed Bundle/APK → Android App Bundle (.aab)** für den **Play Store**.

---

## 4. iOS-App bauen (nur auf dem Mac)

```bash
npm run open:ios       # baut www, synct und öffnet Xcode
```

In **Xcode**:
- Signing-Team auswählen (Apple-ID / Developer-Account)
- **Run ▶** auf Simulator/iPhone zum Testen
- **Product → Archive** → über den Organizer in den **App Store** hochladen.

---

## 5. Nach Änderungen am Spiel

Wenn du `pechmagnet.html` änderst, einfach neu synchronisieren:

```bash
npm run sync           # kopiert das Spiel neu nach www/ und aktualisiert beide Apps
```

Dann in Android Studio / Xcode erneut bauen.

---

## 6. In die Stores hochladen

| Store | Konto | Datei | Hinweis |
|------|-------|-------|---------|
| **Google Play** | Play-Developer (einmalig 25 $) | signiertes **.aab** | Store-Eintrag + Datenschutzerklärung nötig |
| **Apple App Store** | Apple Developer (99 $/Jahr) | Archive via Xcode | **Mac Pflicht**, App-Review durch Apple |

> Apple lehnt reine „verpackte Webseiten" manchmal ab (Richtlinie 4.2). Ein echtes
> Spiel wie Pech-Magnet mit Interaktion/Inhalt geht in der Regel durch.

---

## App-Infos (in `capacitor.config.json` anpassbar)

- **App-ID:** `com.pechmagnet.app`  ← vor der ersten Store-Veröffentlichung auf deine eigene Domain/ID ändern
- **Name:** `Pech-Magnet`
- **Web-Verzeichnis:** `www`

## Icons & Splash (optional, empfohlen)

```bash
npm install @capacitor/assets --save-dev
# ein 1024x1024 Icon als ./assets/icon.png ablegen, dann:
npx capacitor-assets generate
```

Erzeugt automatisch alle App-Icons und Splash-Screens für Android & iOS.
