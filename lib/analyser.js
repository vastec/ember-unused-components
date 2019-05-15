'use strict';

const colors = require('colors/safe');
const fs = require('fs-extra');

const lookup = require('./lookup');

module.exports = {
  components: [],
  unusedComponents: [],

  /**
   * Looks for component's usage in file (read by @param filename)
   *
   * @param {String} filename - path to file
   */
  componentLookupInFile(filename) {
    let data = fs.readFileSync(filename, 'utf8');

    this.components.forEach(component => {
      let hasCurlyBracesInvocation = lookup.curlyBraces(data, component);
      let hasAngleBracketsInvocation = lookup.angleBrackets(data, component);

      if (hasCurlyBracesInvocation || hasAngleBracketsInvocation) {
        let unusedIndex = this.unusedComponents.indexOf(component);

        if (unusedIndex !== -1) {
          this.unusedComponents.splice(unusedIndex, 1);
        }
      }
    });
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
   */
  isWhitelisted(componentOnWhitelist) {
    let hasWildcard = componentOnWhitelist.indexOf('*') !== -1;

    if (hasWildcard) {
      let whitelisted = [];

      componentOnWhitelist = componentOnWhitelist.replace('*', '');

      this.unusedComponents.forEach(unusedComponent => {
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
  logResults() {
    let percentage = (this.unusedComponents.length / this.components.length) * 100;

    console.log('\n No. of components:', this.components.length);
    console.log(
      ' No. of unused components:',
      this.unusedComponents.length,
      colors.dim(`(${percentage.toFixed(2)}%)`)
    );

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
   * @param {object} config
   * @param {string} [pathToCheck]
   * @private
   */
  mapComponents(config, pathToCheck) {
    pathToCheck = pathToCheck || `./${config.componentsPath}`;

    let componentsPath = `./${config.componentsPath}/`;
    let files = fs.readdirSync(pathToCheck);

    files.forEach((item, index) => {
      let filename = `${pathToCheck}/${files[index]}`;
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this.mapComponents(config, filename);
      } else {
        let recognizer = config.usePods ? '/component.js' : '.js';

        if (filename.includes(recognizer)) {
          let componentName = filename.replace(recognizer, '').replace(componentsPath, '');
          this.components.push(componentName);
        }
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
  respectWhitelist(whitelist) {
    if (Array.isArray(whitelist)) {
      whitelist.forEach(component => {
        let whitelisted = this.isWhitelisted(component);

        if (whitelisted) {
          let toRemove = Array.isArray(whitelisted) ? whitelisted : [component];

          toRemove.forEach(item => {
            let unusedIndex = this.unusedComponents.indexOf(item);
            this.unusedComponents.splice(unusedIndex, 1);
          });
        }
      });
    }
  },

  /**
   * Recursively search for any file in project that could contain reference to component
   *
   * @param {object} config
   * @param {string} [pathToCheck]
   * @private
   */
  scanProject(config, pathToCheck) {
    pathToCheck = pathToCheck || `./${config.appPath}`;

    let files = fs.readdirSync(pathToCheck);

    files.forEach((item, index) => {
      let filename = `${pathToCheck}/${files[index]}`;
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this.scanProject(config, filename);
      } else {
        if ((filename.includes('.hbs') || filename.includes('.js')) && !_isIgnored(filename)) {
          this.componentLookupInFile(filename);
        }
      }
    });
  },
};

/**
 * Checks if the file is on the list of ignored files. Which means that any occurrences of the component don't count here.
 *
 * @param {object} config
 * @param {array} config.ignore
 * @param {string} filename
 * @returns {boolean}
 * @private
 */
function _isIgnored(config, filename) {
  return Array.isArray(config.ignore) && config.ignore.includes(filename);
}
