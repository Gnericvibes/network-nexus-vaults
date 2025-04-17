
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
  EventEmitter: {
    new(): {
      _events: Record<string, Function[]>;
      _maxListeners: number | undefined;
      addListener(type: string, listener: Function): any;
      on(type: string, listener: Function): any;
      removeListener(type: string, listener: Function): any;
      emit(type: string, ...args: any[]): boolean;
    };
    prototype: {
      addListener(type: string, listener: Function): any;
      on(type: string, listener: Function): any;
      removeListener(type: string, listener: Function): any;
      emit(type: string, ...args: any[]): boolean;
    };
  };
}

declare const global: Window;
