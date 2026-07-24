const fs = require('fs');
const path = 'c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/isAnimationActive=\{false\}/g, 'isAnimationActive={true}\n                  animationDuration={1200}\n                  animationEasing="ease-out"');
fs.writeFileSync(path, content);
