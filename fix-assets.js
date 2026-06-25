const fs = require('fs');

const PNG_ORANGE = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e00000000c4944415408d76360d8430000000200016221bc330000000049454e44ae426082',
  'hex'
);

const PNG_BLACK = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de' +
  '0000000c4944415408d7636060600000000400012706a8f70000000049454e44ae426082',
  'hex'
);

fs.writeFileSync('assets/icon.png', PNG_ORANGE);
fs.writeFileSync('assets/adaptive-icon.png', PNG_ORANGE);
fs.writeFileSync('assets/favicon.png', PNG_ORANGE);
fs.writeFileSync('assets/splash.png', PNG_BLACK);
console.log('Assets créés !');