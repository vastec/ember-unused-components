import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('3.4 LTS - get config', t => {
  let expectedConfig = {
    appPath: '/test-apps/ember_lts_3_4/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_3_4/app/components',
  };
  let commandOptions = { path: '/test-apps/ember_lts_3_4/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.4 LTS - map components', t => {
  let config = {
    appPath: '/test-apps/ember_lts_3_4/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_3_4/app/components',
  };

  let expectedComponents = [
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

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('3.4 LTS - look for unused components and calculate stats', t => {
  let config = {
    appPath: '/test-apps/ember_lts_3_4/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: false,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_3_4/app/components',
  };

  let expectedComponents = [
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

  let expectedUnusedComponents = ['max-button', 'user/user-signature'];

  let expectedStats = {
    'huge-button': { name: 'huge-button', count: 1, curly: 0, angle: 1 },
    'max-button': { name: 'max-button', count: 0, curly: 0, angle: 0 },
    'medium-button': { name: 'medium-button', count: 1, curly: 0, angle: 1 },
    'mini-button': { name: 'mini-button', count: 2, curly: 0, angle: 2 },
    'user/user-avatar': { name: 'user/user-avatar', count: 1, curly: 1, angle: 0 },
    'user/user-card': { name: 'user/user-card', count: 1, curly: 1, angle: 0 },
    'user/user-info': { name: 'user/user-info', count: 1, curly: 1, angle: 0 },
    'user/user-signature': { name: 'user/user-signature', count: 0, curly: 0, angle: 0 },
    'x-button': { name: 'x-button', count: 1, curly: 1, angle: 0 },
    'y-button': { name: 'y-button', count: 1, curly: 1, angle: 0 },
    'z-button': { name: 'z-button', count: 0, curly: 0, angle: 0 },
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
