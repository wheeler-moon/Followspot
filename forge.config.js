const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './src/icons/icons/mac/icon',
    name: 'SpotPlot',
    extraResource: ['./src/icon.png'],
    osxSign: {
      identity: 'Developer ID Application: WHEELER DAVID MOON (299TQ9H5QB)',
      'hardened-runtime': true,
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
    },
    osxNotarize: {
      tool: 'notarytool',
      keychainProfile: 'AC_PASSWORD',
    },
  },
  rebuildConfig: {},
  hooks: {
    postPackage: async (forgeConfig, options) => {
      if (process.platform !== 'darwin') return;
      const { execSync } = require('child_process');
      const path = require('path');
      const appPath = options.outputPaths[0] + '/SpotPlot.app';
      const zipPath = options.outputPaths[0] + '/SpotPlot.zip';
      console.log('Signing:', appPath);
      execSync(`codesign --deep --force --options runtime --entitlements entitlements.plist --sign "Developer ID Application: WHEELER DAVID MOON (299TQ9H5QB)" "${appPath}"`, { stdio: 'inherit' });
      console.log('Zipping for notarization...');
      execSync(`ditto -c -k --keepParent "${appPath}" "${zipPath}"`, { stdio: 'inherit' });
      console.log('Notarizing...');
      execSync(`xcrun notarytool submit "${zipPath}" --keychain-profile "AC_PASSWORD" --wait`, { stdio: 'inherit' });
      console.log('Stapling...');
      execSync(`xcrun stapler staple "${appPath}"`, { stdio: 'inherit' });
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
    {
    name: '@electron-forge/maker-dmg',
    config: {
      format: 'ULFO',
      name: 'SpotPlot',
    },
  },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
