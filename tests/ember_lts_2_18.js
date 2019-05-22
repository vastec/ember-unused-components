import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('2.18 LTS - get config', t => {
  let expectedConfig = {
    appPath: '/test-apps/ember_lts_2_18/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18/app/components',
  };
  let commandOptions = { path: '/test-apps/ember_lts_2_18/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('2.18 LTS - map components', t => {
  let config = {
    appPath: '/test-apps/ember_lts_2_18/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18/app/components',
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  analyser.mapComponents(config);

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('2.18 LTS - look for unused components and calculate stats', t => {
  let config = {
    appPath: '/test-apps/ember_lts_2_18/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18/app/components',
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'user/user-something',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = ['user/user-signature'];

  let expectedStats = {
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
    'x-button': { name: 'x-button', count: 2, curly: 0, angle: 0, js: 1, componentHelper: 1 },
    'y-button': { name: 'y-button', count: 7, curly: 1, angle: 0, js: 6, componentHelper: 0 },
    'z-button': { name: 'z-button', count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
  };

  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components'
  );
  t.deepEqual(analyser.stats, expectedStats, 'has properly calculated stats');
});
