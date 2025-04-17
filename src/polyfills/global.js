
// Polyfill for global object needed by WalletConnect
import nextTick from 'next-tick';
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: nextTick
};
