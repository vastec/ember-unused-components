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
      sourcePaths: [],
      projectRoot: commandOptions.path,
      failOnUnused: !!commandOptions.failOnUnused,
      ignore: [],
      includeAddons: !!commandOptions.includeAddons,
      whitelist: [],
      isAddon: _isAddon(commandOptions.path),
      componentPaths: [],
    };

    // todo get /app /addon or /src for searching
    this.config.sourcePaths = this.getsourcePaths(this.config.projectRoot, commandOptions);

    let componentPaths = [];
    componentPaths.push(...this.getcomponentPaths(this.config.projectRoot, commandOptions));

    if (this.config.includeAddons) {
      this.config.filterAddonsBy = '*';

      if (typeof commandOptions.includeAddons == 'string') {
        this.config.filterAddonsBy = commandOptions.includeAddons;
      }

      let addonPaths = this.getAddonPaths(
        this.config.projectRoot,
        commandOptions,
        this.config.filterAddonsBy
      );
      this.config.addonPaths = addonPaths;
      for (let addonPath of addonPaths) {
        componentPaths.push(
          ...this.getcomponentPaths(path.join(this.config.projectRoot, addonPath), commandOptions)
        );
      }
    }

    this.config.componentPaths = componentPaths;

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

    if (commandOptions.debug) {
      console.log(this.config);
    }

    return this.config;
  },

  getsourcePaths: function(rootPath) {
    let componentPaths = [];
    if (_isAddon(rootPath)) {
      componentPaths = ['src', 'addon'];
    } else {
      componentPaths = ['src', 'app'];
    }

    let paths = componentPaths.map(s => path.join(rootPath, s));
    return paths.filter(p => fs.existsSync(path.join(process.cwd(), p)));
  },

  getcomponentPaths: function(rootPath, commandOptions) {
    let podModulePrefix = _getPodModulePrefix(this.config.projectRoot, commandOptions, this.config);
    let componentPathsuffixes = [
      'app/components',
      'app/templates/components',
      'src/ui/components',
      'addon/components',
      'addon/templates/components',
    ];

    if (podModulePrefix) {
      componentPathsuffixes.push(`app/${podModulePrefix}/${constants.DEFAULT_COMPONENTS_DIR_NAME}`);
    }

    let paths = componentPathsuffixes.map(s => path.join(rootPath, s));
    return paths.filter(p => fs.existsSync(path.join(process.cwd(), p)));
  },

  getAddonPaths: function(rootPath, commandOptions, filterAddonsBy) {
    let pathPrefix = path.join(process.cwd(), rootPath);

    let searchString = path.join(
      pathPrefix,
      `node_modules/${filterAddonsBy}/{addon,ember-cli-build.js}`
    );

    let files = glob.sync(searchString, {
      root: commandOptions.projectRoot,
    });

    let addonPaths = files
      .map(f => path.normalize(f))
      .map(f => path.dirname(f.replace(pathPrefix, '/')));

    return [...new Set(addonPaths)]; // return unique paths;
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
function _getEmberConfigFile(projectPath) {
  const emberConfigRelPath = path.join(projectPath, constants.EMBER_CONFIG_REL_PATH);
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
  // This could be an addon config file, or the root project config
  let configFile = _getEmberConfigFile(path);

  if (typeof configFile.podModulePrefix === 'string') {
    return configFile.podModulePrefix.replace(configFile.modulePrefix + '/', '');
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
function _isAddon(rootPath) {
  return fs.existsSync(path.join(process.cwd(), rootPath, 'addon'));
}
