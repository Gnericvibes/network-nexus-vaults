
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

// Define util with proper inherits implementation
window.util = window.util || {};

// This is a critical fix - implement util.inherits properly
window.util.inherits = function inherits(ctor, superCtor) {
  if (superCtor) {
    ctor.super_ = superCtor;
    const tempObj = Object.create(superCtor.prototype);
    tempObj.constructor = ctor;
    ctor.prototype = tempObj;
  }
};

// Add EventEmitter polyfill
function EventEmitter() {
  this._events = {};
  this._maxListeners = undefined;
}

EventEmitter.prototype.addListener = function(type, listener) {
  if (!this._events[type]) this._events[type] = [];
  this._events[type].push(listener);
  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.removeListener = function(type, listener) {
  if (!this._events[type]) return this;
  const list = this._events[type];
  const position = list.indexOf(listener);
  if (position !== -1) list.splice(position, 1);
  return this;
};

EventEmitter.prototype.emit = function(type) {
  if (!this._events[type]) return false;
  const args = Array.prototype.slice.call(arguments, 1);
  const listeners = this._events[type].slice();
  for (let i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
  return true;
};

// Make EventEmitter available globally
window.EventEmitter = EventEmitter;

// Force all the polyfills to be applied immediately
console.log("Polyfills loaded with enhanced util.inherits implementation", {
  buffer: !!window.Buffer,
  util: !!window.util,
  utilInherits: typeof window.util.inherits === 'function',
  eventEmitter: !!window.EventEmitter
});

