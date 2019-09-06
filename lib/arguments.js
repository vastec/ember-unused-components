'use strict';

module.exports = {
  argv: null,

  /**
   * Maps arguments that were passed to the script from command line and
   * return them with given values or default values.
   *
   * @returns {object}
   */
  init() {
    if (this.argv) {
      return this.argv;
    }

    this.argv = require('yargs')
      .help('help')
      .alias('help', 'h')
      .version()
      .alias('version', 'v')
      .option('debug', {
        type: 'boolean',
        describe: 'throws errors into console, no graceful handling',
      })
      .option('path', {
        type: 'string',
        default: '',
        describe: 'path to root directory of a project',
      })
      .option('pods', {
        alias: 'p',
        type: 'boolean',
        describe: 'use pods structure',
      })
      .option('pods-dir', {
        alias: 'pd',
        type: 'string',
        describe: 'path to pods directory',
      })
      .option('stats', {
        alias: 's',
        type: 'boolean',
        describe: 'show stats',
      })
      .option('occurrences', {
        alias: 'o',
        type: 'boolean',
        describe: 'show occurrences',
      })
      .option('fail-on-unused', {
        alias: 'f',
        type: 'boolean',
        default: false,
        describe: 'throw errors when unused components are found',
      })
      .locale('en').argv;

    return this.argv;
  },
};
