'use strict';

module.exports = {
  name: 'ember-unused-components',
  includedCommands() {
    return {
      'unused:components': require('./lib/commands/unused')
    };
  }
};
