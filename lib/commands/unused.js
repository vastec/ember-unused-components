'use strict';

const components = require('../components');

module.exports = {
  name: 'unused:components',
  aliases: ['uc'],
  availableOptions: [
    { name: 'pods', type: Boolean, default: false, aliases: ['p'] },
    { name: 'pods-dir', type: String, aliases: ['pd'] }
  ],
  description: 'Search for unused components in your Ember project',

  /**
   * Run function for `ember unused:components` command
   *
   * @param {object} commandOptions
   * @param {boolean} [commandOptions.pods=false] - use pods directories structure
   * @param {string} [commandOptions.podsDir] - force pods directory (relative to appPath)
   */
  run(commandOptions) {
    components.searchForUnusedComponents(commandOptions);
  }
};
