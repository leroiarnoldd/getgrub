const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

// Monorepo: the dashboard workspace hoists React 18 to the root node_modules,
// while this app uses React 19. Hoisted packages (e.g. @react-navigation)
// would otherwise resolve the root copy and crash with "Invalid hook call",
// so pin every "react" import to this app's single copy.
const appReactDir = path.resolve(projectRoot, 'node_modules/react');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react') {
    return context.resolveRequest(context, appReactDir, platform);
  }
  if (moduleName.startsWith('react/')) {
    return context.resolveRequest(
      context,
      path.join(appReactDir, moduleName.slice('react/'.length)),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
