'use strict';

module.exports = {
  name: 'ember-unused-components',
  includedCommands() {
    return {
      unusedComponents: require('./lib/commands/unused')
    };
  }
};
