'use strict';

const colors = require('colors/safe');
const fs = require('fs-extra');
const path = require('path');

const appPath = './app/';
const configRelPath = '/config/environment.js';
const defaultComponentsPath = appPath + 'components';

module.exports = {
  components: [],
  componentsPath: '',
  ignore: [],
  unusedComponents: [],
  whitelist: [],

  /**
   * MAIN FUNCTION
   *
   * Entry function for `ember-unused-components` addon
   *
   * @param {object} commandOptions - arguments passed when script was executed
   * @param {boolean} [commandOptions.pods=false] - use pods directories structure
   * @param {string} [commandOptions.podsDir] - force pods directory (relative to appPath)
   */
  searchForUnusedComponents(commandOptions = { pods: false }) {
    console.log(colors.cyan.underline('Searching for unused components:'));

    // Main sequence
    this._config(commandOptions);
    this._mapComponents(this.componentsPath);
    this._scanProject(appPath);
    this._respectWhitelist(this.whitelist);
    this._logResults();
  },

  ////////
  ////      Private methods
  //

  /**
   * Looks for component's usage in file (read by @param filename)
   *
   * @param {String} filename - path to file
   * @private
   */
  _componentLookupInFile(filename) {
    let data = fs.readFileSync(filename, "utf8");

    this.components.forEach((component) => {
      if (data.indexOf(component) >= 0) {
        let unusedIndex = this.unusedComponents.indexOf(component);

        if (unusedIndex !== -1) {
          this.unusedComponents.splice(unusedIndex, 1);
        }
      }
    });
  },

  /**
   * Configures the addon
   *
   * @param {object} commandOptions - arguments passed when script was executed
   * @param {boolean} commandOptions.pods - use pods directories structure
   * @param {string} [commandOptions.podsDir] - force pods directory (relative to appPath)
   * @private
   */
  _config(commandOptions) {
    let configPath = process.cwd() + configRelPath;
    let configFn = require(configPath);
    let configFile = configFn('development');

    let usePods = commandOptions.pods || typeof configFile.podModulePrefix === 'string';

    // Set `componentsPath`
    if (usePods) {
      if (commandOptions.podsDir) {
        this.componentsPath = appPath + commandOptions.podsDir;
      } else {
        this.componentsPath = appPath + configFile.podModulePrefix.replace(configFile.modulePrefix + '/', '') + '/components';
      }
    } else {
      this.componentsPath = defaultComponentsPath;
    }

    // Check addon config
    let addonConfig = configFile['ember-unused-components'];
    let hasAddonConfig = typeof addonConfig === 'object' && addonConfig !== null;
    let hasWhitelist = hasAddonConfig && Array.isArray(addonConfig.whitelist);
    let hasIgnoredFiles = hasAddonConfig && Array.isArray(addonConfig.ignore);

    // Set whitelist if available
    if (hasWhitelist) {
      this.whitelist = addonConfig.whitelist;
    }

    // Set ignore array with ignored files if available
    if (hasIgnoredFiles) {
      this.ignore = addonConfig.ignore;
    }
  },

  /**
   * Checks if the file is on the list of ignored files. Which means that any occurrences of the component don't count here.
   *
   * @param {string} filename
   * @returns {boolean}
   * @private
   */
  _isIgnored(filename) {
    return this.ignore.includes(filename);
  },

  /**
   * Checks if component has been whitelisted and shouldn't be treated as unused.
   * Especially the dynamic components may show up as unused. This addon is fully static analysis tool and we don't
   * have a chance to realise which components were truly used via e.g. functional tests (which also may not cover all scenarios).
   *
   * Typical dynamic component look like this:
   *
   * ```hbs
   *  {{component name car=car}}
   * ```
   *
   * ```js
   *  name: computed('car.type', function () {
   *      return `car-card-${this.get('car.type')}`;
   *  });
   * ```
   *
   * Which may result in having following components in use:
   *  car.type = 'suv'    =>  {{car-card-suv car=car}}
   *  car.type = 'sport'  =>  {{car-card-sport car=car}}
   *  car.type = 'sedan'  =>  {{car-card-sedan car=car}}
   *
   * Unfortunately this static analysis tool doesn't understand it yet and don't know that your component `car-card-suv`
   * has been used anywhere.
   * You can whitelist these components from being marked as unused by referencing to them directly:
   * ```
   *  whitelist: ['car-card-suv', 'car-card-sport', 'car-card-sedan']
   * ```
   * or by using wildcard:
   * ```
   *  whitelist: ['car-card-*']
   * ```
   *
   * @param {string} componentOnWhitelist - name of component
   * @returns {boolean|array} - true/false if non-wildcard name was used, array with components to remove from the list if wildcard was used
   * @private
   */
  _isWhitelisted(componentOnWhitelist) {
    let hasWildcard = componentOnWhitelist.indexOf('*') !== -1;

    if (hasWildcard) {
      let whitelisted = [];

      componentOnWhitelist = componentOnWhitelist.replace('*', '');

      this.unusedComponents.forEach((unusedComponent) => {
        if (unusedComponent.indexOf(componentOnWhitelist) !== -1) {
          whitelisted.push(unusedComponent);
        }
      });

      return whitelisted;
    } else {
      return this.unusedComponents.includes(componentOnWhitelist);
    }
  },

  /**
   * Outputs the results
   *
   * @private
   */
  _logResults() {
    console.log(' No. of components:', this.components.length);
    console.log(' No. of unused components:', this.unusedComponents.length);

    if (this.unusedComponents.length > 0) {
      console.log(colors.cyan('\n Unused components:'));

      this.unusedComponents.forEach(component => console.log(`  - ${component}`));
    } else {
      console.log(colors.green('\n Congratulations! No unused components found in your project.'));
    }
  },

  /**
   * Recursively search for components in given directory
   *
   * @param {string} pathToCheck
   * @private
   */
  _mapComponents(pathToCheck) {
    let componentsPath = this.componentsPath.replace('./', '') + '/';
    let files = fs.readdirSync(pathToCheck);

    files.forEach((item, index) => {
      let filename = path.join(pathToCheck, files[index]);
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this._mapComponents(filename);
      } else if (filename.includes('component.js')) {
        let componentName = filename.replace('/component.js', '').replace(componentsPath, '');
        this.components.push(componentName);
      }
    });

    this.unusedComponents = this.components.slice();
  },

  /**
   * Removes whitelisted components from unused components list
   *
   * @param {array} whitelist
   * @private
   */
  _respectWhitelist(whitelist) {
    whitelist.forEach((component) => {
      let whitelisted = this._isWhitelisted(component);

      if (whitelisted) {
        let toRemove = Array.isArray(whitelisted) ? whitelisted : [component];

        toRemove.forEach((item) => {
          let unusedIndex = this.unusedComponents.indexOf(item);
          this.unusedComponents.splice(unusedIndex, 1);
        });
      }
    });
  },

  /**
   * Recursively search for any file in project that could contain reference to component
   *
   * @param {string} pathToCheck
   * @private
   */
  _scanProject(pathToCheck) {
    let files = fs.readdirSync(pathToCheck);

    files.forEach((item, index) => {
      let filename = path.join(pathToCheck, files[index]);
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this._scanProject(filename);
      } else {
        if ((filename.includes('.hbs') || filename.includes('.js')) && !this._isIgnored(filename)) {
          this._componentLookupInFile(filename);
        }
      }
    });
  }
};
