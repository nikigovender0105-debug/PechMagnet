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

> Für Werbung vorher die IDs in `admob.config.json` eintragen – siehe **Abschnitt 6**.
> Ohne Änderung läuft die App mit Google-Testanzeigen.

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

## 6. Werbung (Google AdMob)

Das Spiel bringt AdMob über das Plugin `@capacitor-community/admob` mit. **Im Browser
passiert nichts** – Werbung läuft nur in der gebauten App. `pechmagnet.html` bleibt also
weiterhin einfach per Doppelklick spielbar.

### Was eingebaut ist

| Format | Wo | Verhalten |
|--------|----|-----------|
| **Banner** | Menü, Shop, Skins, Erfolge | Unten angedockt; die Menüs machen automatisch Platz. Nie während eines Laufs. |
| **Interstitial** | nach dem Game-Over | Nur bei jedem **3.** Lauf, mit kurzer Verzögerung, damit die Punkte zuerst lesbar sind. |
| **Rewarded 1** | Game-Over-Screen | Button „MÜNZEN VERDOPPELN: +X" – **verdoppelt die im Lauf gesammelten Münzen**. Nur wenn es überhaupt etwas zu verdoppeln gibt. |
| **Rewarded 2** | Shop, Abschnitt „GRATIS MÜNZEN" | „Werbe-Video" für **250 Münzen**, sobald **mindestens 30 Sekunden** Werbung zusammengekommen sind. |

Beide Rewarded-Buttons erscheinen nur, wenn wirklich ein Video geladen ist.

**Zur 30-Sekunden-Regel:** Wie lang ein Video ist, bestimmt Google – das lässt sich nicht
anfordern. Das Spiel misst deshalb die **tatsächlich angesehene Zeit** und zählt sie
zusammen: zwei 15-Sekunden-Videos ergeben also auch die Belohnung, und übrige Sekunden
bleiben für den nächsten Anlauf stehen (im Shop als „Angesehen: 15 / 30 Sek." sichtbar).
Ein **abgebrochenes** Video bringt keine Sekunden – gezählt wird nur, was AdMob als
verdiente Belohnung bestätigt.

Einwilligung (**DSGVO/UMP**) und **App-Tracking-Transparency** (iOS) werden beim App-Start
automatisch abgefragt, bevor die erste Anzeige angefordert wird.

### Einrichten

1. Konto auf https://apps.admob.com anlegen, dort **App registrieren** (Android und iOS
   sind zwei getrennte Apps) und je **Anzeigenblock** für Banner, Interstitial und Rewarded
   erstellen.
2. Die IDs in **`admob.config.json`** eintragen – das ist die **einzige** Stelle dafür:

   ```json
   {
     "testing": false,
     "appId": {
       "android": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
       "ios":     "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
     },
     "adUnits": {
       "banner":       { "android": "ca-app-pub-…/…", "ios": "ca-app-pub-…/…" },
       "interstitial": { "android": "ca-app-pub-…/…", "ios": "ca-app-pub-…/…" },
       "rewarded":     { "android": "ca-app-pub-…/…", "ios": "ca-app-pub-…/…" }
     },
     "interstitialEveryNthGameOver": 3,
     "doubleRunCoins": true,
     "shopAdCoins": 250,
     "shopAdMinSeconds": 30
   }
   ```

3. Plugin installieren und synchronisieren:

   ```bash
   npm install
   npm run sync
   ```

`npm run sync` erledigt danach alles selbst: Spiel nach `www/` kopieren, die IDs in die
Seite injizieren, `cap sync`, und über `scripts/patch-admob.js` die **App-ID in
`AndroidManifest.xml` und `Info.plist`** schreiben (inkl. `AD_ID`-Berechtigung für
Android 13+ und `NSUserTrackingUsageDescription` für iOS). Das Script ist idempotent und
läuft auch nach einem neuen `npx cap add android` wieder mit.

### Stellschrauben

| Schlüssel | Bedeutung |
|-----------|-----------|
| `interstitialEveryNthGameOver` | Vollbild-Anzeige nur bei jedem n-ten Game-Over (`1` = jedes Mal). |
| `doubleRunCoins` | `false` schaltet das Verdoppeln nach dem Lauf ab. |
| `shopAdCoins` | Münzen für die Werbe-Aktion im Shop (`0` blendet sie aus). |
| `shopAdMinSeconds` | Nötige Werbesekunden dafür. |

### `testing`-Schalter

- `"testing": true` (Standard) → **immer Google-Testanzeigen**, egal welche IDs eingetragen sind.
- `"testing": false` → echte Anzeigen. Erst kurz vor der Store-Veröffentlichung umstellen.

> ⚠️ **Niemals mit echten IDs selbst auf die eigenen Anzeigen klicken** – das gilt als
> Klickbetrug und führt zur Sperrung des AdMob-Kontos. Zum Testen immer `testing: true`.

### Fürs Veröffentlichen nötig

- **Play Store:** Im Store-Eintrag „Enthält Werbung" angeben, Datenschutzerklärung
  verlinken und im Data-Safety-Formular die Werbe-ID deklarieren.
- **App Store:** Unter „App Privacy" die Datenerfassung für Werbung angeben.
- Eine **Datenschutzerklärung ist mit Werbung Pflicht** – ohne sie wird die App abgelehnt.

### Werbung wieder abschalten

`admob.config.json` löschen (oder umbenennen) und `npm run build` – dann wird ohne
Werbe-Konfiguration gebaut und alle Anzeigen-Aufrufe laufen ins Leere.

---

## 7. In die Stores hochladen

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
