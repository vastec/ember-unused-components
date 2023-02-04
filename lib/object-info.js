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
    let fullName = this.objectName(config, filepath);
    let topLevelName = fullName.split('/')[0];
    let info = {
      key: fullName,
      name: fullName,
      type: this.objectType(config, filepath),
      parentKey: topLevelName,
      subComponentKeys: {},
      isSubComponent: topLevelName != fullName,
      stats: {
        count: 0,
        js: 0,
        curly: 0,
        angle: 0,
        componentHelper: 0,
      },
      occurrences: [],
      filePaths: [],
      fileType: path.extname(filepath),
    };

    if (addonInfo) {
      info.addonName = addonInfo.name;
      info.addonPath = addonInfo.sourcePath;
      info.key = `[${addonInfo.name}] ${fullName}`;
      info.parentKey = `[${addonInfo.name}] ${topLevelName}`;
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
    let name = filename;
    name = _removeLeadingPath(name, 'components/', '/');
    name = _removeLeadingPath(name, 'templates/', '/');

    return name
      .replace('component.js', '')
      .replace('template.hbs', '')
      .replace('index.js', '')
      .replace('index.ts', '')
      .replace('index.hbs', '')
      .replace('.js', '')
      .replace('.ts', '')
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
