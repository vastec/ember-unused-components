'use strict';

const constants = require('./constants');

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

    let emberConfigFile;

    try {
      emberConfigFile = _getEmberConfigFile(commandOptions);
    } catch (e) {
      throw e;
    }

    this.config = {
      appPath: commandOptions.path + constants.APP_PATH,
      ignore: [],
      usePods: commandOptions.pods || typeof emberConfigFile.podModulePrefix === 'string',
      whitelist: [],
    };

    // Initial value, more will be added below
    this.config.componentsPath = this.config.appPath;

    // Specify `componentsPath` based on config
    if (this.config.usePods) {
      if (commandOptions.podsDir) {
        this.config.componentsPath += commandOptions.podsDir;
      } else {
        this.config.componentsPath +=
          emberConfigFile.podModulePrefix.replace(emberConfigFile.modulePrefix + '/', '') +
          '/' +
          constants.DEFAULT_COMPONENTS_DIR_NAME;
      }
    } else {
      this.config.componentsPath += constants.DEFAULT_COMPONENTS_DIR_NAME;
    }

    // Look for script's config
    let eucConfig = _getEUCConfigFile(commandOptions);
    let hasConfig = typeof eucConfig === 'object' && eucConfig !== null;
    let hasWhitelist = hasConfig && Array.isArray(eucConfig.whitelist);
    let hasIgnoredFiles = hasConfig && Array.isArray(eucConfig.ignore);

    // Set whitelist if available
    if (hasWhitelist) {
      this.config.whitelist = eucConfig.whitelist;
    }

    // Set ignore array with ignored files if available
    if (hasIgnoredFiles) {
      this.config.ignore = eucConfig.ignore;
    }

    return this.config;
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
function _getEmberConfigFile(commandOptions) {
  const emberConfigRelPath = commandOptions.path + constants.EMBER_CONFIG_REL_PATH;
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
