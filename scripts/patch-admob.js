// Traegt die AdMob-App-ID aus admob.config.json in die nativen Projekte ein.
// Laeuft automatisch nach "cap sync" / "cap add" (siehe package.json) und ist idempotent:
// mehrfaches Ausfuehren aendert nichts. Fehlt android/ oder ios/, wird der Teil uebersprungen.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'admob.config.json'), 'utf8'));

const AD_ID_PERMISSION = 'com.google.android.gms.permission.AD_ID';
const APP_ID_META = 'com.google.android.gms.ads.APPLICATION_ID';

function patchAndroid() {
  const file = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(file)) return 'android/ fehlt – uebersprungen (erst "npx cap add android" ausfuehren)';
  const appId = cfg.appId && cfg.appId.android;
  if (!appId) return 'keine appId.android in admob.config.json – uebersprungen';

  let xml = fs.readFileSync(file, 'utf8');
  const before = xml;

  // 1) App-ID als meta-data im <application>-Block
  const metaTag = `        <meta-data\n            android:name="${APP_ID_META}"\n            android:value="${appId}" />`;
  const existing = new RegExp(`[ \\t]*<meta-data[^>]*android:name="${APP_ID_META}"[\\s\\S]*?/>`);
  if (existing.test(xml)) {
    xml = xml.replace(existing, metaTag);
  } else {
    xml = xml.replace(/([ \t]*)<\/application>/, `${metaTag}\n$1</application>`);
  }

  // 2) AD_ID-Berechtigung (ab Android 13 fuer die Werbe-ID erforderlich)
  if (xml.indexOf(AD_ID_PERMISSION) < 0) {
    xml = xml.replace(/([ \t]*)<\/manifest>/,
      `$1    <uses-permission android:name="${AD_ID_PERMISSION}" />\n$1</manifest>`);
  }

  if (xml === before) return 'AndroidManifest.xml war bereits aktuell';
  fs.writeFileSync(file, xml);
  return `AndroidManifest.xml aktualisiert (App-ID ${appId})`;
}

// Setzt einen Key im Info.plist – ersetzt den Wert, wenn der Key schon existiert.
function setPlistString(plist, key, value) {
  const re = new RegExp(`(<key>${key}</key>\\s*)<string>[\\s\\S]*?</string>`);
  if (re.test(plist)) return plist.replace(re, `$1<string>${value}</string>`);
  return plist.replace(/([ \t]*)<\/dict>\s*<\/plist>/,
    `$1\t<key>${key}</key>\n$1\t<string>${value}</string>\n$1</dict>\n</plist>`);
}

function patchIos() {
  const file = path.join(root, 'ios', 'App', 'App', 'Info.plist');
  if (!fs.existsSync(file)) return 'ios/ fehlt – uebersprungen (nur auf dem Mac via "npx cap add ios")';
  const appId = cfg.appId && cfg.appId.ios;
  if (!appId) return 'keine appId.ios in admob.config.json – uebersprungen';

  let plist = fs.readFileSync(file, 'utf8');
  const before = plist;
  plist = setPlistString(plist, 'GADApplicationIdentifier', appId);
  plist = setPlistString(plist, 'NSUserTrackingUsageDescription',
    cfg.iosTrackingMessage || 'Wir nutzen deine Daten, um dir passendere Werbung zu zeigen.');

  if (plist === before) return 'Info.plist war bereits aktuell';
  fs.writeFileSync(file, plist);
  return `Info.plist aktualisiert (App-ID ${appId})`;
}

console.log('AdMob-Patch:');
for (const step of [patchAndroid, patchIos]) {
  try {
    console.log('  - ' + step());
  } catch (e) {
    console.warn('  - FEHLER in ' + step.name + ': ' + e.message);
  }
}
if (cfg.testing) console.log('  ! testing:true – es laufen Google-TESTANZEIGEN (admob.config.json).');
