var Dimensions = require('react-native').Dimensions;
var Platform = require('react-native').Platform;

function getWidth() {
  return Dimensions.get('window').width;
}

function isWeb() {
  return Platform.OS === 'web';
}

function isDesktop() {
  return isWeb() && getWidth() >= 1024;
}

function isTablet() {
  return isWeb() && getWidth() >= 768 && getWidth() < 1024;
}

function isMobile() {
  return !isWeb() || getWidth() < 768;
}

// Largeur max du contenu sur desktop
var MAX_WIDTH = 480;

function containerStyle() {
  if (isDesktop()) {
    return {
      maxWidth: MAX_WIDTH,
      width: '100%',
      alignSelf: 'center',
    };
  }
  return { flex: 1 };
}

function webContainer() {
  if (isDesktop()) {
    return {
      flex: 1,
      backgroundColor: '#F0F0F0',
      alignItems: 'center',
      justifyContent: 'center',
    };
  }
  return { flex: 1 };
}

module.exports = {
  getWidth,
  isWeb,
  isDesktop,
  isTablet,
  isMobile,
  containerStyle,
  webContainer,
  MAX_WIDTH,
};