const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Mock react-native-maps on web (no native support)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, 'lib/maps-web-mock.js') };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
