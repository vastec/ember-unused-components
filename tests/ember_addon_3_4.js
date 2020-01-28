import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('3.4 Addon - get config', t => {
  let expectedConfig = {
    sourcePaths: ['/test-apps/ember_addon_3_13/addon'],
    projectRoot: '/test-apps/ember_addon_3_13/',
    ignore: ['app/templates/freestyle.hbs'],
    includeAddons: false,
    isAddon: true,
    whitelist: ['z-button'],
    componentPaths: [
      '/test-apps/ember_addon_3_13/app/components',
      '/test-apps/ember_addon_3_13/addon/components',
      '/test-apps/ember_addon_3_13/addon/templates/components',
    ],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_addon_3_13/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.4 Addon - map components', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_addon_3_13/addon'],
    projectRoot: '/test-apps/ember_addon_3_13/',
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    isAddon: true,
    componentPaths: [
      '/test-apps/ember_addon_3_13/app/components',
      '/test-apps/ember_addon_3_13/addon/components',
      '/test-apps/ember_addon_3_13/addon/templates/components',
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
    'user-profile',
    'x-button',
    'y-button',
    'z-button',
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
    'user-profile',
    'x-button',
    'y-button',
    'z-button',
  ];

  analyser.mapComponents(config);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.components)
      .filter(c => c.stats.count == 0 && !c.whitelisted)
      .map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('3.4 Addon - look for unused components and calculate stats', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_addon_3_13/app', '/test-apps/ember_addon_3_13/addon'],
    projectRoot: '/test-apps/ember_addon_3_13/',
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    componentPaths: [
      '/test-apps/ember_addon_3_13/app/components',
      '/test-apps/ember_addon_3_13/addon/components',
      '/test-apps/ember_addon_3_13/addon/templates/components',
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
    'user-profile',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = [
    'max-button',
    'user/user-signature',
    'user/user-something',
    'user-profile',
  ];

  let expectedStats = {
    'huge-button': { count: 1, curly: 0, angle: 1, js: 0, componentHelper: 0 },
    'max-button': { count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
    'medium-button': {
      count: 1,
      curly: 0,
      angle: 1,
      js: 0,
      componentHelper: 0,
    },
    'mini-button': { count: 2, curly: 0, angle: 2, js: 0, componentHelper: 0 },
    'something/quite/deep-deep': {
      count: 1,
      curly: 0,
      angle: 1,
      js: 0,
      componentHelper: 0,
    },
    'user-profile': {
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-avatar': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-card': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-info': {
      count: 1,
      curly: 1,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-signature': {
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'user/user-something': {
      count: 0,
      curly: 0,
      angle: 0,
      js: 0,
      componentHelper: 0,
    },
    'x-button': { count: 1, curly: 0, angle: 0, js: 1, componentHelper: 0 },
    'y-button': { count: 1, curly: 1, angle: 0, js: 0, componentHelper: 0 },
    'z-button': { count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
  };

  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  t.deepEqual(
    Object.values(analyser.components).map(c => c.key),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    Object.values(analyser.components)
      .filter(c => c.stats.count == 0 && !c.whitelisted)
      .map(c => c.key),
    expectedUnusedComponents,
    'has proper list of unused components'
  );
  Object.keys(expectedStats).forEach(componentKey => {
    t.deepEqual(
      analyser.components[componentKey].stats,
      expectedStats[componentKey],
      `has properly calculated stats for ${componentKey}`
    );
  });
});
