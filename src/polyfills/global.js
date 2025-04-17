
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

// Ensure the util polyfill is accessible globally
if (typeof global !== 'undefined' && !global.util) {
  global.util = window.util;
}

// Add EventEmitter polyfill that might be expected by WalletConnect
const EventEmitter = function() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
};

EventEmitter.prototype.addListener = function(type, listener) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  this._events[type].push(listener);
  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.removeListener = function(type, listener) {
  if (!this._events || !this._events[type]) return this;
  const list = this._events[type];
  const position = list.indexOf(listener);
  if (position !== -1) list.splice(position, 1);
  return this;
};

EventEmitter.prototype.emit = function(type) {
  if (!this._events || !this._events[type]) return false;
  const args = Array.prototype.slice.call(arguments, 1);
  const listeners = this._events[type].slice();
  for (let i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
  return true;
};

// Make EventEmitter available globally
window.EventEmitter = EventEmitter;
