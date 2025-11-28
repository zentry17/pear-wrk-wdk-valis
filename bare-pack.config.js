// bare-pack.config.js
module.exports = {
    external: [
      'worker',           // ← this is the important one
      'crypto',
      'buffer',
      'process',
      'events'
    ]
  };