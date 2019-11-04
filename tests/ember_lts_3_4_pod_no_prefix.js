import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('3.4 LTS POD no prefix - get config', t => {
  let expectedConfig = {
    appPaths: ['/test-apps/ember_lts_3_4_pod_no_prefix/app/'],
    projectRoot: '/test-apps/ember_lts_3_4_pod_no_prefix/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    useModuleUnification: false,
    includeAddons: false,
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_lts_3_4_mixed_pod_no_prefix/app/components'],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_lts_3_4_pod_no_prefix/' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.4 LTS POD no prefix - map components', t => {
  let config = {
    appPaths: ['/test-apps/ember_lts_3_4_pod_no_prefix/app/'],
    projectRoot: '/test-apps/ember_lts_3_4_pod_no_prefix/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    useModuleUnification: false,
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_lts_3_4_mixed_pod_no_prefix/app/components'],
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
  ];

  analyser.mapComponents(config);

  t.deepEqual(analyser.components, expectedComponents, 'has proper list of components');
  t.deepEqual(
    analyser.unusedComponents,
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('3.4 LTS POD no prefix - look for unused components and calculate stats', t => {
  let config = {
    appPaths: ['/test-apps/ember_lts_3_4_pod_no_prefix/app/'],
    projectRoot: '/test-apps/ember_lts_3_4_pod_no_prefix/',
    ignore: ['app/templates/freestyle.hbs'],
    usePods: true,
    useModuleUnification: false,
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_lts_3_4_pod_no_prefix/app/components'],
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
  ];

  let expectedUnusedComponents = ['max-button', 'user/user-signature'];

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
