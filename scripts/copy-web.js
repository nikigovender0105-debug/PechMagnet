// Kopiert das Spiel (pechmagnet.html) als www/index.html – das ist der Inhalt der App.
// Dabei wird die AdMob-Konfiguration aus admob.config.json in die Seite injiziert,
// sodass die IDs nur an einer Stelle gepflegt werden muessen.
// Plattformunabhängig (läuft unter Windows/macOS/Linux).
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'pechmagnet.html');
const outDir = path.join(root, 'www');
const out = path.join(outDir, 'index.html');
const MARKER = '<!--ADMOB_CONFIG-->';

// Nur die Felder, die das Spiel im Browser braucht – die App-ID bleibt in den nativen Projekten.
function adsConfigScript() {
  const cfgFile = path.join(root, 'admob.config.json');
  if (!fs.existsSync(cfgFile)) return '';
  const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  const client = {
    testing: cfg.testing !== false,
    adUnits: cfg.adUnits || {},
    interstitialEveryNthGameOver: cfg.interstitialEveryNthGameOver || 1,
    doubleRunCoins: cfg.doubleRunCoins !== false,
    shopAdCoins: cfg.shopAdCoins || 0,
    shopAdMinSeconds: cfg.shopAdMinSeconds || 0
  };
  // "<" maskieren, damit der JSON-Inhalt das <script>-Tag nicht vorzeitig beenden kann
  const json = JSON.stringify(client).replace(/</g, '\\u003c');
  return '<script>window.ADMOB_CONFIG=' + json + ';</script>';
}

let html = fs.readFileSync(src, 'utf8');
const inject = adsConfigScript();
if (html.indexOf(MARKER) >= 0) {
  html = html.replace(MARKER, inject);
  console.log(inject ? 'AdMob-Konfiguration injiziert.' : 'Keine admob.config.json gefunden – ohne Werbung gebaut.');
} else {
  console.warn('Hinweis: Marker ' + MARKER + ' fehlt in pechmagnet.html – AdMob-Konfiguration nicht injiziert.');
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html);
console.log('Kopiert: pechmagnet.html -> www/index.html');
