import test from 'ava';

const analyser = require('../lib/analyser');
let utils = require('../lib/utils');

test('3.4 LTS with addons - get config', t => {
  utils.config = null;
  let expectedConfig = {
    appPaths: ['/test-apps/ember_lts_3_4_with_addons/app'],
    addonPaths: ['/node_modules/company-buttons', '/node_modules/company-services'],
    projectRoot: '/test-apps/ember_lts_3_4_with_addons/',
    ignore: ['app/templates/freestyle.hbs'],
    includeAddons: true,
    filterAddonsBy: '*',
    isAddon: false,
    whitelist: ['z-button'],
    searchPaths: [
      '/test-apps/ember_lts_3_4_with_addons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/app/templates/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/templates/components',
    ],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_lts_3_4_with_addons/', includeAddons: true };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.4 LTS with addons - get config with wildcard addon', t => {
  utils.config = null;
  let expectedConfig = {
    appPaths: ['/test-apps/ember_lts_3_4_with_addons/app'],
    addonPaths: ['/node_modules/company-buttons'],
    projectRoot: '/test-apps/ember_lts_3_4_with_addons/',
    ignore: ['app/templates/freestyle.hbs'],
    filterAddonsBy: 'company-b*',
    includeAddons: true,
    isAddon: false,
    whitelist: ['z-button'],
    searchPaths: [
      '/test-apps/ember_lts_3_4_with_addons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/app/templates/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/templates/components',
    ],
    failOnUnused: false,
  };

  let commandOptions = {
    path: '/test-apps/ember_lts_3_4_with_addons/',
    includeAddons: 'company-b*',
  };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.4 LTS with addon - map components', t => {
  let config = {
    appPaths: ['/test-apps/ember_lts_3_4_with_addons/app'],
    addonPaths: ['/node_modules/company-buttons', '/node_modules/company-services'],
    projectRoot: '/test-apps/ember_lts_3_4_with_addons/',
    includeAddons: true,
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    searchPaths: [
      '/test-apps/ember_lts_3_4_with_addons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/app/templates/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/app/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/components',
      '/test-apps/ember_lts_3_4_with_addons/node_modules/company-buttons/addon/templates/components',
    ],
  };

  let expectedComponents = [
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'something/quite/deep-deep',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
    '[company-buttons] button-a',
    '[company-buttons] button-b',
    '[company-buttons] button-c',
  ];

  let expectedUnusedComponents = [
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'something/quite/deep-deep',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
    '[company-buttons] button-a',
    '[company-buttons] button-b',
    '[company-buttons] button-c',
  ];

  analyser.mapComponents(config);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.unusedComponents).map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('3.4 LTS - look for unused components and calculate stats', t => {
  let config = {
    appPaths: ['/test-apps/ember_lts_3_4_with_addons/app'],
    projectRoot: '/test-apps/ember_lts_3_4_with_addons/',
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_lts_3_4_with_addons/app/components'],
  };

  let expectedComponents = [
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'something/quite/deep-deep',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
    '[company-buttons] button-a',
    '[company-buttons] button-b',
    '[company-buttons] button-c',
  ];

  let expectedUnusedComponents = [
    'max-button',
    'user/user-signature',
    '[company-buttons] button-c',
  ];

  let expectedStats = {
    'huge-button': { name: 'huge-button', count: 1, curly: 0, angle: 1, js: 0, componentHelper: 0 },
    'max-button': { name: 'max-button', count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
    'medium-button': {
      name: 'medium-button',
      count: 1,
      curly: 0,
      angle: 1,
      js: 0,
      componentHelper: 0,
    },
    'mini-button': { name: 'mini-button', count: 2, curly: 0, angle: 2, js: 0, componentHelper: 0 },
    'something/quite/deep-deep': {
      name: 'something/quite/deep-deep',
      count: 1,
      curly: 0,
      angle: 1,
      js: 0,
      componentHelper: 0,
    },
    'user/user-avatar': {
      name: 'user/user-avatar',
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-card': {
      name: 'user/user-card',
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-info': {
      name: 'user/user-info',
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-signature': {
      name: 'user/user-signature',
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-something': {
      name: 'user/user-something',
      count: 6,
      curly: 0,
      angle: 0,
      js: 6,
      componentHelper: 0,
    },
    '[company-buttons] button-a': {
      name: 'button-a',
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
      source: 'company-buttons',
    },
    '[company-buttons] button-b': {
      name: 'button-b',
      count: 1,
      curly: 0,
      angle: 1,
      js: 0,
      componentHelper: 0,
      source: 'company-buttons',
    },
    '[company-buttons] button-c': {
      name: 'button-c',
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
      source: 'company-buttons',
    },

    'x-button': { name: 'x-button', count: 2, curly: 0, angle: 0, js: 1, componentHelper: 1 },
    'y-button': { name: 'y-button', count: 7, curly: 1, angle: 0, js: 6, componentHelper: 0 },
    'z-button': { name: 'z-button', count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
  };

  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.unusedComponents).map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
  t.deepEqual(analyser.stats, expectedStats, 'has properly calculated stats');
});
