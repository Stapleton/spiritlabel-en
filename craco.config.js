const path = require('path');

module.exports = {
  webpack: {
    alias: {
      'ecp': path.resolve(__dirname, 'src/ecp_react'),
    },
  },
};
