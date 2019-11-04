'use strict';

const constants = require('./constants');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

module.exports = {
  config: null,

  /**
   * Configures the script based on given command options and config file found in Ember project.
   *
   * To check `commandOptions` use `help` in terminal:
   * ```
   * $ ember-unused-components --help
   * ```
   * or check `/lib/arguments.js` file.
   *
   * @param {object} commandOptions - arguments passed when script was executed
   */
  getConfig(commandOptions) {
    if (this.config) {
      return this.config;
    }

    this.config = {
      appPaths: [],
      projectRoot: commandOptions.path,
      failOnUnused: !!commandOptions.failOnUnused,
      ignore: [],
      includeAddons: !!commandOptions.includeAddons,
      whitelist: [],
      searchPaths: [],
    };

    // todo get /app /addon or /src for searching
    this.config.appPaths = this.getAppPaths(this.config.projectRoot, commandOptions);

    let searchPaths = [];
    searchPaths.push(...this.getSearchPaths(this.config.projectRoot, commandOptions));

    if (this.config.includeAddons) {
      this.config.filterAddonsBy = '*';

      if (typeof this.config.includeAddons === 'string') {
        this.config.filterAddonsBy = this.config.includeAddons;
      }

      let addonPaths = this.getAddonPaths(commandOptions, this.config.filterAddonsBy);
      this.config.addonPaths = addonPaths;
      for (let addonPath of addonPaths) {
        searchPaths.push(...this.getSearchPaths(addonPath, commandOptions));
      }
    }

    this.config.searchPaths = searchPaths;

    // Look for script's config
    let eucConfig = _getEUCConfigFile(commandOptions);
    let hasConfig = typeof eucConfig === 'object' && eucConfig !== null;
    let hasWhitelist = hasConfig && Array.isArray(eucConfig.whitelist);
    let hasIgnoredFiles = hasConfig && Array.isArray(eucConfig.ignore);
    let shouldFailOnUnused = hasConfig && eucConfig.failOnUnused;

    // Set whitelist if available
    if (hasWhitelist) {
      this.config.whitelist = eucConfig.whitelist;
    }

    // Set ignore array with ignored files if available
    if (hasIgnoredFiles) {
      this.config.ignore = eucConfig.ignore;
    }

    // Set fail in ci if available
    if (shouldFailOnUnused) {
      this.config.failOnUnused = eucConfig.failOnUnused;
    }

    return this.config;
  },

  getAppPaths: function(rootPath, commandOptions) {
    let podModulePrefix = _getPodModulePrefix(this.config.projectRoot, commandOptions, this.config);
    let searchPaths = ['app', 'src', 'addon'];

    if (podModulePrefix) {
      searchPaths.push(podModulePrefix);
    }

    let paths = searchPaths.map(s => path.join(rootPath, s));
    return paths.filter(p => fs.existsSync(path.join(process.cwd(), p)));
  },

  getSearchPaths: function(rootPath, commandOptions) {
    let podModulePrefix = _getPodModulePrefix(this.config.projectRoot, commandOptions, this.config);
    let searchPathSuffixes = ['app/components', 'src/ui/components', 'addon/components'];

    if (podModulePrefix) {
      searchPathSuffixes.push(`${podModulePrefix}/${constants.DEFAULT_COMPONENTS_DIR_NAME}`);
    }

    let paths = searchPathSuffixes.map(s => path.join(rootPath, s));
    return paths.filter(p => fs.existsSync(path.join(process.cwd(), p)));
  },

  getAddonPaths: function(commandOptions, filterAddonsBy) {
    let files = glob.sync(`./node_modules/${filterAddonsBy}/{addon,ember-cli-build.js}`, {
      root: commandOptions.projectRoot,
    });
    let addonPaths = files.map(f => path.normalize(f)).map(f => path.dirname(f));
    return addonPaths;
  },
};

/**
 * Gets the config of Ember project.
 *
 * @param {object} commandOptions - arguments passed when script was executed
 * @param {boolean} [commandOptions.path=''] - path to root directory of a project
 * @returns {object}
 * @private
 */
function _getEmberConfigFile(path) {
  const emberConfigRelPath = path + constants.EMBER_CONFIG_REL_PATH;
  let emberConfigPath = process.cwd() + emberConfigRelPath;
  let emberConfigFn = require(emberConfigPath);

  return emberConfigFn('development');
}

/**
 * Gets the config of Ember Unused Components script.
 *
 * @param {object} commandOptions - arguments passed when script was executed
 * @param {boolean} [commandOptions.path=''] - path to root directory of a project
 * @returns {object|null}
 * @private
 */
function _getEUCConfigFile(commandOptions) {
  const rootPath =
    commandOptions.path +
    (commandOptions.path.charAt(commandOptions.path.length - 1) === '/' ? '' : '/');
  const eucConfigRelPath = `${rootPath}${constants.EUC_CONFIG_REL_PATH}`;
  const eucConfigPath = process.cwd() + eucConfigRelPath;

  try {
    return require(eucConfigPath);
  } catch (e) {
    return null;
  }
}

/**
  Searches for ember addons based on config flag

  * @param {path} path to project directory,
  * @param {object} commandOptions - arguments passed when script was executed
  * @param {object} config - config object
  * @returns {string|null}
  * @private
*/

function _getPodModulePrefix(path, commandOptions, config) {
  if (commandOptions.podsDir && path === config.projectRoot) {
    // podDir option only valid for root project
    return commandOptions.podsDir;
  }
  if (fs.pathExistsSync(path)) {
    // This could be an addon config file, or the root project config
    let configFile = _getEmberConfigFile(path);

    if (typeof configFile.podModulePrefix === 'string') {
      return configFile.podModulePrefix.replace(configFile.modulePrefix + '/', '');
    }
  }
}

/**
  Determines whether root project is an addon. If so, there are slightly different
  paths to check

  * @param {object} commandOptions - arguments passed when script was executed
  * @param {boolean} [commandOptions.path=''] - path to root directory of a project
  * @returns {object|null}
  * @private
*/
function _isAddon(commandOptions) {
  try {
    let stat = fs.lstatSync(commandOptions.path + 'addon');
    if (stat.isDirectory()) {
      return true;
    }
  } catch (e) {
    return false; // doesn't exist, probably not an addon
  }
}
