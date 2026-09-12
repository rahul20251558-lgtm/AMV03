const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');
// Fix duplicate dataMode
app = app.replace(/dataMode=\{dataMode\}\s*dataMode=\{dataMode\}/g, 'dataMode={dataMode}');
fs.writeFileSync('src/App.tsx', app, 'utf-8');

