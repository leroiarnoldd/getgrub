const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// zustand's ESM build uses `import.meta`, which is invalid in Metro's web
// bundle. Its CommonJS build (the one used on native) uses process.env
// instead, so force every zustand import to resolve to the CJS file.
const zustandDir = path.dirname(require.resolve('zustand/package.json'));
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
    const sub = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    const cjs = path.join(zustandDir, `${sub}.js`);
    if (fs.existsSync(cjs)) {
      return { type: 'sourceFile', filePath: cjs };
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
