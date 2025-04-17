
// Polyfill for global object needed by WalletConnect
window.global = window;
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: require('next-tick')
};
