
// Polyfill for global object needed by WalletConnect
import nextTick from 'next-tick';
import { Buffer } from 'buffer';

// Create a global object
window.global = window;
window.Buffer = Buffer;

// Process polyfill
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: nextTick
};

// Util polyfill - specifically for util.inherits
window.util = window.util || {};
window.util.inherits = function(ctor, superCtor) {
  if (superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
};
