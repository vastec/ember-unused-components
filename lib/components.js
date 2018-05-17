'use strict';

const colors = require('colors/safe');
const fs = require('fs-extra');
const path = require('path');

const appPath = './app/';
const defaultComponentsPath = appPath + 'components';
const defaultComponentsPathWithPods = appPath + 'modules/components';

module.exports = {
  components: [],
  componentsPath: '',
  unusedComponents: [],

  /**
   * MAIN FUNCTION
   *
   * Entry function for `ember-unused-components` addon
   *
   * @param [pods=false] - use pods directories structure
   */
  searchForUnusedComponents(pods = false) {
    console.log(colors.cyan.underline('Searching for unused components:'));

    // Main sequence
    this._config(pods);
    this._mapComponents(this.componentsPath);
    this._scanProject(appPath);
    this._logResults();
  },

  ////////
  ////      Private methods
  //

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
   * @param {boolean} pods
   * @private
   */
  _config(pods) {
    this.componentsPath = pods ? defaultComponentsPathWithPods : defaultComponentsPath;
  },

  /**
   * Outputs the results
   *
   * @private
   */
  _logResults() {
    console.log(' No. of components:', this.components.length);
    console.log(' No. of unused components:', this.unusedComponents.length);
    console.log(colors.cyan('\n Unused components:'));

    this.unusedComponents.forEach(component => console.log(`  - ${component}`));
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
        if (filename.includes('.hbs') || filename.includes('.js')) {
          this._componentLookupInFile(filename);
        }
      }
    });
  }
};
