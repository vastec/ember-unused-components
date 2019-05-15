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

test('3.4 LTS - look for unused components', t => {
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

  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components'
  );
});
