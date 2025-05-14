// Polyfills for browser APIs in Node.js environment
if (typeof self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
  global.window = global;
}

if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    documentElement: {},
    querySelector: () => null,
  };
} 