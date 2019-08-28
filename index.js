#!/usr/bin/env node

'use strict';

const colors = require('colors/safe');
const isCi = require('is-ci');

const analyser = require('./lib/analyser');
const args = require('./lib/arguments');
const utils = require('./lib/utils');

/**
 * MAIN FUNCTION
 *
 * Entry function for `ember-unused-components`
 */
function main() {
  const commandOptions = args.init();
  let config;

  // Read config
  try {
    config = utils.getConfig(commandOptions);
  } catch (e) {
    console.log(
      colors.red("Can't find Ember config. Are you sure you are running this in root directory?")
    );

    if (commandOptions.debug) {
      console.log(e);
    }
    return;
  }

  // Main sequence
  console.log(colors.dim('[1/3]'), '🗺️  Mapping the project...');
  analyser.mapComponents(config);

  console.log(colors.dim('[2/3]'), '🔍 Looking for components usage...');
  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  console.log(colors.dim('[3/3]'), '✔️  Done');
  analyser.logResults(commandOptions.stats, commandOptions.occurrences, config.whitelist);

  if (isCi && analyser.unusedComponents.length) {
    throw new Error(`You have ${analyser.unusedComponents.length} unused component.`);
  }
}

main();
