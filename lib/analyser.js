'use strict';

const colors = require('colors/safe');
const fs = require('fs-extra');
const lookup = require('./lookup');
const stats = require('./stats');
const objectInfo = require('./object-info');

module.exports = {
  components: {},
  example: true,

  /**
   * Looks for component's usage in file (read by @param filename)
   *
   * @param {string} filename - path to file
   * @param {string} type - file type
   */
  componentLookupInFile(filename, type) {
    let data = fs.readFileSync(filename, 'utf8');

    Object.values(this.components).forEach(component => {
      let lookupResult = null;

      if (type === 'js') {
        lookupResult = lookup.componentLookupInJs(data, component);
      } else if (type === 'hbs') {
        lookupResult = lookup.componentLookupInHbs(data, component);
      }

      if (lookupResult) {
        lookupResult.key = component.key;

        if (lookupResult.fileType === 'js') {
          component.stats.js += lookupResult.lines.length;
        } else if (lookupResult.fileType === 'hbs') {
          component.stats[lookupResult.type] += lookupResult.lines.length;
        }
        component.stats.count += lookupResult.lines.length;
        component.occurrences.push(
          Object.assign(
            {
              file: filename,
            },
            lookupResult
          )
        );
      }
    });
  },

  /**
   * Checks if component has been whitelisted and shouldn't be treated as unused.
   * Especially the dynamic components may show up as unused. This script is fully static analysis tool and we don't
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

    let unusedComponents = Object.values(this.components).filter(c => c.stats.count === 0);

    if (hasWildcard) {
      componentOnWhitelist = componentOnWhitelist.replace('*', '');

      unusedComponents.forEach(unusedComponent => {
        if (unusedComponent.name.indexOf(componentOnWhitelist) !== -1) {
          unusedComponent.whitelisted = true;
        }
      });
    } else {
      return Object.values(this.unusedComponents).find(
        component => component.name === componentOnWhitelist
      );
    }
  },

  /**
   * Get unused components
   *
   * @returns {array} components
   */
  unusedComponents() {
    let values = Object.values(this.components).filter(c => {
      return c.stats.count === 0 && !c.whitelisted;
    });

    return values;
  },

  /**
   * Outputs the results
   *
   * @param {boolean} showStats
   * @param {boolean} showOccurrences
   * @param {array} whitelist
   */
  logResults(showStats, showOccurrences, whitelist) {
    let unusedComponents = this.unusedComponents();
    let unusedComponentCount = unusedComponents.length;
    let componentCount = Object.keys(this.components).length;
    let percentage = (unusedComponentCount / componentCount) * 100;

    console.log('\n No. of components:', componentCount);
    console.log(
      ' No. of unused components:',
      unusedComponentCount,
      colors.dim(isNaN(percentage) ? '' : `(${percentage.toFixed(2)}%)`)
    );

    if (unusedComponentCount > 0) {
      console.log(colors.cyan('\n Unused components:'));
      unusedComponents.forEach(component => console.log(`  - ${component.key}`));
    } else {
      console.log(colors.green('\n Congratulations! No unused components found in your project.'));
    }

    if (showStats) {
      let mostUsedComponent = stats.getTheMostCommon(this.components);

      if (mostUsedComponent) {
        console.log(
          colors.cyan('\n The most used component:'),
          mostUsedComponent.key,
          colors.dim(
            `(${mostUsedComponent.stats.count} occurrence${
              mostUsedComponent.stats.count > 1 ? 's' : ''
            })`
          )
        );
      }

      let countUsedJustOnce = stats.countUsedJustOnce(this.components);
      if (countUsedJustOnce > 0) {
        let percentageJustOnce = (countUsedJustOnce / componentCount) * 100;
        console.log(
          colors.cyan(' The number of components used just once:'),
          countUsedJustOnce,
          colors.dim(`(${percentageJustOnce.toFixed(2)}%)`)
        );
      }

      let curlyVsAngle = stats.curlyVsAngle(this.components);
      console.log(
        colors.cyan(' Usage of {{curly-braces}} vs <AngleBrackets> syntax:'),
        curlyVsAngle.curly,
        colors.dim(
          isNaN(curlyVsAngle.curlyPercentage) ? '' : `(${curlyVsAngle.curlyPercentage.toFixed(2)}%)`
        ),
        colors.cyan('vs'),
        curlyVsAngle.angle,
        colors.dim(
          isNaN(curlyVsAngle.anglePercentage) ? '' : `(${curlyVsAngle.anglePercentage.toFixed(2)}%)`
        )
      );

      let componentHelpersCount = stats.countComponentHelpers(this.components);
      console.log(
        colors.cyan(' Usage of (component "component-name") helper in templates:'),
        componentHelpersCount
      );

      let countJsUsage = stats.countJsUsage(this.components);
      if (countUsedJustOnce > 0) {
        console.log(
          colors.cyan(' Usage in JS files (e.g. through `import` or ELT):'),
          countJsUsage
        );
      }
    }

    if (showOccurrences) {
      console.log(colors.green('\n Components occurrences:'));

      Object.keys(this.components).forEach(key => {
        let component = this.components[key];

        // start with the parent components
        if (!component.isSubComponent && component.stats.count > 0) {
          console.log(colors.cyan(`\n  ${key}:`));

          if (whitelist.includes(key)) {
            console.log(colors.red(`    - whitelisted`));
          }

          component.occurrences.forEach(o => {
            console.log(`\n   > ${o.file}`);
            o.lines.forEach(line => console.log(colors.gray(`    - ${line}`)));
          });

          Object.keys(component.subComponentKeys).forEach(subComponentKey => {
            if (this.components[subComponentKey].stats.count > 0) {
              console.log(colors.cyan(`\n     ${subComponentKey}:`));
              let subcomponent = this.components[subComponentKey];

              subcomponent.occurrences.forEach(p => {
                console.log(`\n       > ${p.file}`);
                p.lines.forEach(line => console.log(colors.gray(`         - ${line}`)));
              });
            }
          });
        }
      });
    }

    console.log('');
  },

  /**
   * Map components based on config
   *
   * @param {object} config
   * @private
   */

  mapComponents(config) {
    config.componentPaths.forEach(path => this.mapComponentPath(config, './' + path));
  },

  /**
   * Recursively search for components in given directory
   *
   * @param {object} config
   * @param {string} [pathToCheck]
   * @private
   */

  mapComponentPath(config, pathToCheck) {
    let files = fs.readdirSync(pathToCheck);

    files.forEach((item, index) => {
      let filename = `${pathToCheck}/${files[index]}`;
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this.mapComponentPath(config, filename);
      } else {
        let component = objectInfo.get(config, filename);
        if (component.type == 'component') {
          if (!this.components[component.key]) {
            this.components[component.key] = component;
          }

          this.components[component.key].filePaths.push(filename);
        }
      }
    });

    // Add all the subcomponent keys to the parents
    Object.values(this.components).forEach(component => {
      if (component.isSubComponent) {
        let parentComponent = this.components[component.parentKey];
        if (parentComponent) {
          parentComponent.subComponentKeys[component.key] = true;
        }
      }
    });
  },

  /**
   * Marks components as whitelisted for unused components list
   *
   * @param {array} whitelist
   * @private
   */
  respectWhitelist(whitelist) {
    if (Array.isArray(whitelist)) {
      whitelist.forEach(componentOnWhitelist => {
        let hasWildcard = componentOnWhitelist.indexOf('*') !== -1;
        let unusedComponents = Object.values(this.components).filter(c => c.stats.count === 0);

        if (hasWildcard) {
          componentOnWhitelist = componentOnWhitelist.replace('*', '');

          unusedComponents.forEach(unusedComponent => {
            if (unusedComponent.key.indexOf(componentOnWhitelist) !== -1) {
              unusedComponent.whitelisted = true;
            }
          });
        } else {
          let selectedComponents = Object.values(this.components).filter(
            component => component.key === componentOnWhitelist
          );

          selectedComponents.forEach(c => (c.whitelisted = true));
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

  scanProject(config) {
    config.sourcePaths.forEach(path => this.scanProjectPath(config, './' + path));
  },

  /**
   * Recursively search for any file in project that could contain reference to component
   *
   * @param {object} config
   * @param {string} [pathToCheck]
   * @private
   */
  scanProjectPath(config, pathToCheck) {
    let files;
    try {
      files = fs.readdirSync(pathToCheck);
    } catch (e) {
      console.log(e);
    }

    files.forEach((item, index) => {
      let filename = `${pathToCheck}/${files[index]}`;
      filename = filename.replace(/\/\//gi, '/');
      let stat = fs.lstatSync(filename);

      if (stat.isDirectory()) {
        this.scanProjectPath(config, filename);
      } else {
        if (
          (filename.includes('.hbs') || filename.includes('.js') || filename.includes('.ts')) &&
          !filename.includes('-test.js') &&
          !_isIgnored(config, filename)
        ) {
          let type = filename.includes('.hbs') ? 'hbs' : 'js';
          this.componentLookupInFile(filename, type);
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
