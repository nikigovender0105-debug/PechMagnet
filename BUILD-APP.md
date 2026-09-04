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
| **Rewarded 2** | Shop: quadratische Werbe-Kachel unter dem Spezial-Ticket **und** das grüne „+" an der Münzanzeige | Beide starten dasselbe Video: **250 Münzen**, sobald **mindestens 30 Sekunden** Werbung zusammengekommen sind. Das „+" erscheint nur, wenn ein Video bereitsteht. |

Beide Rewarded-Buttons erscheinen nur, wenn wirklich ein Video geladen ist.

**Zur 30-Sekunden-Regel:** Wie lang ein Video ist, bestimmt Google – das lässt sich nicht
anfordern. Das Spiel misst deshalb die **tatsächlich angesehene Zeit** und zählt sie
zusammen: zwei 15-Sekunden-Videos ergeben also auch die Belohnung, und übrige Sekunden
bleiben für den nächsten Anlauf stehen (als Fortschrittsbalken auf der Kachel sichtbar).
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
| `shopAdCoins` | Münzen für die Werbe-Kachel im Shop (`0` blendet sie aus). |
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

## 7. In-App-Käufe (Google Play)

Käufe laufen über **`cordova-plugin-purchase`** (Google Play Billing). Wie bei der
Werbung passiert **im Browser nichts** – der Kauf-Bereich im Shop bleibt dort einfach
ausgeblendet.

### Was verkauft wird

| Produkt-ID | Art | Gibt |
|-----------|-----|------|
| `coins_small` | Verbrauchsartikel | 1.000 Münzen |
| `coins_medium` | Verbrauchsartikel | 6.000 Münzen |
| `coins_large` | Verbrauchsartikel | 20.000 Münzen |
| `no_ads` | Einmalkauf | Banner und Vollbild-Anzeigen aus (freiwillige Videos bleiben) |
| `skin_pack` | Einmalkauf | Neon-Geist, Galaxie, Der König, Zauberer, Regenbogen |
| `starter_pack` | Einmalkauf | 3.000 Münzen + 3 Spezial-Tickets + werbefrei |

Was ein Kauf gutschreibt, steht in **`iap.config.json`** – dort lassen sich Beträge,
Skins und Texte ändern, ohne den Spielcode anzufassen. **Preise kommen aus der Play
Console**, nicht aus dieser Datei; der Shop zeigt immer den echten, lokalisierten Preis.

### Einrichten

1. **Zahlungsprofil** anlegen: Play Console → *Einrichtung → Zahlungsprofil*. Ohne das
   lassen sich keine kostenpflichtigen Produkte verkaufen.
2. App **einmal in einen Track hochladen** (internes Testing genügt) – erst dann kennt
   Play das Paket `com.pechmagnet.app` und erlaubt In-App-Produkte.
3. Produkte anlegen: *Monetarisierung → Produkte → In-App-Produkte → Produkt erstellen*.
   Die **IDs müssen exakt** den sechs oben genannten entsprechen, Preis setzen und jedes
   Produkt **aktivieren** (inaktive Produkte tauchen in der App nicht auf).
4. **Testkonten** eintragen: Play Console → *Einrichtung → Lizenztests*. Diese Konten
   kaufen kostenlos, die Kauf-Dialoge sehen aber echt aus.
5. Bauen und synchronisieren:

   ```bash
   npm install
   npm run sync
   ```

`npm run sync` installiert das Plugin ins Android-Projekt, setzt die
`com.android.vending.BILLING`-Berechtigung (macht das Plugin selbst) und hebt über
`scripts/patch-native.js` die **`minSdkVersion` auf 23** an – Google Play Billing 9
verlangt das, Capacitor legt Projekte mit 22 an.

> **Testen geht nur über Play**, nicht über „Run" aus Android Studio: die App muss
> signiert in einem Track liegen und vom Testkonto **aus dem Play Store installiert**
> werden. Sonst bleibt der Kauf-Bereich leer, weil Play keine Produkte liefert.

### Wichtig zu wissen

- **Neue Entwicklerkonten** (privat, seit November 2023) müssen vor der Produktion einen
  **Closed Test mit mindestens 12 Testern über 14 Tage** durchlaufen.
- **Keine Server-Prüfung.** Die App glaubt dem Gerät. Für ein Einzelspieler-Spiel mit
  lokalem Spielstand ist das üblich: wer sich Münzen erschleicht, betrügt nur den eigenen
  Spielstand – es gibt keine Rangliste mit Geldwert. Für echte Absicherung bräuchte es
  einen kleinen Server, der die Belege bei Google prüft.
- **Einmalkäufe werden beim Start wiederhergestellt.** Play liefert sie erneut aus,
  deshalb schreibt das Spiel sie nur einmal gut (`save.iap`). Zusätzlich gibt es unten im
  Kauf-Bereich den Knopf **„Käufe wiederherstellen"** – Google verlangt eine solche
  Möglichkeit.
- **Store-Eintrag:** „Enthält In-App-Käufe" deklarieren und die Preisspanne angeben.
- **iOS:** Dasselbe Plugin kann App-Store-Käufe, dafür müssen die Produkte in App Store
  Connect mit denselben IDs angelegt und der Store dort auf `APPLE_APPSTORE` erweitert
  werden. Aktuell ist nur Google Play verdrahtet.

### Käufe abschalten

`iap.config.json` löschen (oder umbenennen) und `npm run build` – dann wird ohne
Kauf-Konfiguration gebaut und der Bereich erscheint nicht.

---

## 8. In die Stores hochladen

| Store | Konto | Datei | Hinweis |
|------|-------|-------|---------|
| **Google Play** | Play-Developer (einmalig 25 $) | signiertes **.aab** | Store-Eintrag + Datenschutzerklärung nötig; Werbung und In-App-Käufe deklarieren |
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
