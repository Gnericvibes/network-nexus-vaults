
// Polyfill for global object needed by WalletConnect
import nextTick from 'next-tick';

window.global = window;
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: nextTick
};
