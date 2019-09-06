'use strict';

const constants = require('./constants');
const fs = require('fs-extra');

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

    emberConfigFile = _getEmberConfigFile(commandOptions);

    let appPath = commandOptions.path + constants.APP_PATH;

    this.config = {
      appPath: appPath,
      failOnUnused: commandOptions.failOnUnused,
      ignore: [],
      usePods:
        commandOptions.pods ||
        typeof emberConfigFile.podModulePrefix === 'string' ||
        _podsGuess(appPath),
      useModuleUnification: !!(
        emberConfigFile.EmberENV &&
        emberConfigFile.EmberENV.FEATURES &&
        emberConfigFile.EmberENV.FEATURES.EMBER_MODULE_UNIFICATION
      ),
      whitelist: [],
    };

    // Initial value, more will be added below for PODs and classical structure
    this.config.componentsPath = this.config.appPath;

    // Specify `componentsPath` based on config
    if (this.config.useModuleUnification) {
      this.config.appPath = commandOptions.path + constants.SRC_PATH;
      this.config.componentsPath = this.config.appPath + constants.DEFAULT_MU_COMPONENTS_DIR_NAME;
    } else if (this.config.usePods) {
      if (commandOptions.podsDir) {
        this.config.componentsPath += commandOptions.podsDir;
      } else {
        let podModule =
          typeof emberConfigFile.podModulePrefix === 'string'
            ? emberConfigFile.podModulePrefix.replace(emberConfigFile.modulePrefix + '/', '') + '/'
            : '';

        this.config.componentsPath += podModule + constants.DEFAULT_COMPONENTS_DIR_NAME;
      }
    } else {
      this.config.componentsPath += constants.DEFAULT_COMPONENTS_DIR_NAME;
    }

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

/**
 * Tries to guess if POD structure is in use.
 *
 * When we read `environment.js` and see `podModulePrefix` property then we are sure that
 * POD structure is in use. There is no other way to guess that by reading ember files.
 * User (developer) can use `--pods` argument when calling `ember-unused-components` script which
 * informs us about structure but for dev's ergonomics we try our best to guess.
 *
 * Guessing algorithm:
 *  - go to `app/components`
 *  - search through all directories there
 *  - check if all directories have `component.js` or `template.hbs` file
 *  - if at least one doesn't have aforementioned files then it's not PODs
 *
 *  If so, then we guess this is a POD structure.
 *
 * @param {string} appPath - path to application
 * @returns {boolean}
 * @private
 */
function _podsGuess(appPath) {
  let path = './' + appPath + constants.DEFAULT_COMPONENTS_DIR_NAME + '/';
  let hasAllComponentsAsPODs = true;

  try {
    let files = fs.readdirSync(path);

    files.forEach((item, index) => {
      let filename = `${path}/${files[index]}`;
      filename = filename.replace(/\/\//gi, '/');
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        /*
          One level deep check if all of directories of `app/components` have `component.js` or `template.hbs`
         */
        let dirPath = filename;
        let dirPathFiles = fs.readdirSync(dirPath);

        dirPathFiles.forEach((dirItem, dirIndex) => {
          let dirPathFilename = `${dirPath}/${dirPathFiles[dirIndex]}`;
          dirPathFilename = dirPathFilename.replace(/\/\//gi, '/');
          let dirStat = fs.lstatSync(dirPathFilename);

          if (
            !dirStat.isDirectory() &&
            !dirPathFilename.includes('template.hbs') &&
            !dirPathFilename.includes('component.js')
          ) {
            hasAllComponentsAsPODs = false;
          }
        });
      }
    });

    return hasAllComponentsAsPODs;
  } catch (e) {
    return false;
  }
}
