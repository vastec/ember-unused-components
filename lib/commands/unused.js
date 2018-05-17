'use strict';

const components = require('../components');

module.exports = {
  name: 'unused:components',
  aliases: ['uc'],
  availableOptions: [
    { name: 'pods', type: Boolean, default: false, aliases: ['p'] }
  ],
  description: 'Search for unused components in your Ember project',

  /**
   * Run function for `ember unused:components` command
   *
   * @param {object} commandOptions
   * @param {boolean} [commandOptions.pods=false] - use pods directories structure
   */
  run(commandOptions) {
    components.searchForUnusedComponents(commandOptions.pods);
  }
};
