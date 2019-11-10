'use strict';
const path = require('path');

module.exports = {
  /**
   * Returns info object
   *
   * @param {object} config
   * @param {array} config.addonPaths, config.includeAddons
   * @param {string} filename
   * @returns {object}
   * @private
   */

  get(config, filepath) {
    let addonInfo = this.addonInfo(config, filepath);
    let name = this.objectName(config, filepath);
    let info = {
      filePaths: [],
      fileType: path.extname(filepath),
      type: this.objectType(config, filepath),
      name: name,
      key: name,
    };

    if (addonInfo) {
      info.source = addonInfo.name;
      info.sourcePath = addonInfo.sourcePath;
      info.key = `[${addonInfo.name}] ${name}`;
    }

    return info;
  },

  /**
   * Returns object type
   *
   * @param {object} config
   * @param {array} config.addonPaths, config.componentPaths
   * @param {string} filename
   * @returns {object}
   * @private
   */

  objectType: function(config, filename) {
    if (['.hbs', '.js'].includes(path.extname(filename))) {
      if (path.basename(filename).indexOf('-test.js') > -1) {
        return 'test';
      } else if (filename.split('/').includes('components')) {
        return 'component';
      }
    }
  },

  /**
   * Returns object name from path
   *
   * @param {object} config
   * @param {array} config.addonPaths, config.componentPaths
   * @param {string} filename
   * @returns {object}
   * @private
   */

  objectName: function(config, filename) {
    // let addonInfo = _addonInfoFromPath(config, filename);
    let name = filename;
    //
    // if (addonInfo) {
    //   name = _removeLeadingPath(componentName, path.join(addonInfo.sourcePath, 'addon'));
    //   name = _removeLeadingPath(componentName, addonInfo.sourcePath, 'addon');
    // }
    //
    // config.componentPaths.forEach(searchPath => {
    //   if (name.indexOf(searchPath) > -1) {
    //     name = _removeLeadingPath(componentName, searchPath);
    //   }
    // });

    name = _removeLeadingPath(name, 'components/', '/');
    name = _removeLeadingPath(name, 'templates/', '/');

    return name
      .replace('component.js', '')
      .replace('template.hbs', '')
      .replace('.js', '')
      .replace('.hbs', '')
      .replace(/^[\\/\\.]+/, '')
      .replace(/[\\/\\.]$/, '')
      .trim();
  },

  /**
   * Returns addon info object
   *
   * @param {object} config
   * @param {array} config.addonPaths, config.includeAddons
   * @param {string} filename
   * @returns {object}
   * @private
   */

  addonInfo: function(config, filename) {
    let sourcePath, name;

    if (config.includeAddons) {
      for (let addonPath of config.addonPaths) {
        if (filename.indexOf(addonPath) > -1) {
          sourcePath = addonPath;
          name = path.basename(addonPath);
          break;
        }
      }
    }

    if (sourcePath && name) {
      return {
        sourcePath,
        name,
      };
    }
  },
};

/**
 * Returns leading path.
 * we might know that its from an addon at /node_modules/company-addon so we can chop out everything
 * that comes before that path component
 *
 * @param {string} filepath
 * @param {string} subpath
 * @returns {string}
 * @private
 */

function _removeLeadingPath(filepath, subpath) {
  return filepath.replace(new RegExp(`^.+${subpath}`), '');
}
