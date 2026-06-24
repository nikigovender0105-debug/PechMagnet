// Kopiert das Spiel (pechmagnet.html) als www/index.html – das ist der Inhalt der App.
// Plattformunabhängig (läuft unter Windows/macOS/Linux).
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'pechmagnet.html');
const outDir = path.join(root, 'www');
const out = path.join(outDir, 'index.html');

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, out);
console.log('Kopiert: pechmagnet.html -> www/index.html');
