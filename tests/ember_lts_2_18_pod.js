import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('2.18 LTS POD - get config', t => {
  let expectedConfig = {
    appPath: '/test-apps/ember_lts_2_18_pod/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18_pod/app/modules/components',
  };
  let commandOptions = { path: '/test-apps/ember_lts_2_18_pod/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('2.18 LTS POD - map components', t => {
  let config = {
    appPath: '/test-apps/ember_lts_2_18_pod/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18_pod/app/modules/components',
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = [
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

test('2.18 LTS POD - look for unused components', t => {
  let config = {
    appPath: '/test-apps/ember_lts_2_18_pod/app/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    whitelist: ['z-button'],
    componentsPath: '/test-apps/ember_lts_2_18_pod/app/modules/components',
  };

  let expectedComponents = [
    'user/user-avatar',
    'user/user-card',
    'user/user-info',
    'user/user-signature',
    'x-button',
    'y-button',
    'z-button',
  ];

  let expectedUnusedComponents = ['user/user-signature'];

  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components'
  );
});
