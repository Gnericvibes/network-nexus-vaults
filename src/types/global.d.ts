
// Type declarations for global polyfill additions
interface Window {
  global: Window;
  Buffer: typeof Buffer;
  process: {
    env: { DEBUG: undefined };
    version: string;
    nextTick: (callback: Function) => void;
  };
  util: {
    inherits: (ctor: any, superCtor: any) => void;
    [key: string]: any;
  };
  EventEmitter: any;
}

declare const global: Window;
