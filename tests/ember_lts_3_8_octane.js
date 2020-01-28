import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('3.8 LTS Octane - get config', t => {
  let expectedConfig = {
    sourcePaths: ['/test-apps/ember_lts_3_8_octane/app'],
    projectRoot: '/test-apps/ember_lts_3_8_octane/',
    ignore: ['app/templates/freestyle.hbs'],
    includeAddons: false,
    isAddon: false,
    whitelist: ['z-button'],
    componentPaths: [
      '/test-apps/ember_lts_3_8_octane/app/components',
      '/test-apps/ember_lts_3_8_octane/app/templates/components',
    ],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_lts_3_8_octane/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.8 LTS Octane - map components', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_lts_3_8_octane/app'],
    projectRoot: '/test-apps/ember_lts_3_8_octane/',
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    componentPaths: [
      '/test-apps/ember_lts_3_8_octane/app/components',
      '/test-apps/ember_lts_3_8_octane/app/templates/components',
    ],
  };

  let expectedComponents = [
    'alert',
    'counter',
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = [
    'alert',
    'counter',
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
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

test('3.8 LTS Octane - look for unused components and calculate stats', t => {
  let config = {
    sourcePaths: ['/test-apps/ember_lts_3_8_octane/app'],
    projectRoot: '/test-apps/ember_lts_3_8_octane/',
    ignore: ['app/templates/freestyle.hbs'],
    whitelist: ['z-button'],
    componentPaths: ['/test-apps/ember_lts_3_8_octane/app/components'],
  };

  let expectedComponents = [
    'alert',
    'counter',
    'huge-button',
    'max-button',
    'medium-button',
    'mini-button',
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = ['alert', 'max-button', 'user/user-signature'];

  let expectedStats = {
    alert: { count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
    counter: { count: 1, curly: 0, angle: 1, js: 0, componentHelper: 0 },
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
    'x-button': { count: 2, curly: 0, angle: 0, js: 1, componentHelper: 1 },
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
