const fs = require('fs');
const path = 'c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// The Pie and Bar charts have isAnimationActive={true}.
// Let's replace them with false to remove the stuttering.
content = content.replace(/isAnimationActive=\{true\}/g, 'isAnimationActive={false}');

fs.writeFileSync(path, content);
