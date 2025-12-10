const path = require('path');
const pak = require('../package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [pak.name]: path.join(__dirname, '..', pak.source),
          react: path.join(__dirname, 'node_modules', 'react'),
          'react-native': path.join(__dirname, 'node_modules', 'react-native'),
        },
      },
    ],
  ],
};
