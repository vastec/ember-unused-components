import test from 'ava';

const analyser = require('../lib/analyser');
const utils = require('../lib/utils');

test('3.10 + Module Unification - get config', t => {
  let expectedConfig = {
    appPaths: ['/test-apps/ember_3_10_mu/src'],
    projectRoot: '/test-apps/ember_3_10_mu',
    ignore: ['src/ui/routes/application/freestyle.hbs'],
    includeAddons: false,
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_3_10_mu/src/ui/components'],
    failOnUnused: false,
  };
  let commandOptions = { path: '/test-apps/ember_3_10_mu' };
  let result = utils.getConfig(commandOptions);

  t.deepEqual(result, expectedConfig, 'has proper config');
});

test('3.10 + Module Unification - map components', t => {
  let config = {
    appPaths: ['/test-apps/ember_3_10_mu/src'],
    projectRoot: '/test-apps/ember_3_10_mu/',
    ignore: ['src/ui/routes/application/freestyle.hbs'],
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_3_10_mu/src/ui/components'],
  };

  let expectedComponents = [
    'alert',
    'counter',
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
    'alert',
    'counter',
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

  t.deepEqual(
    analyser.components.map(c => c.name),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    analyser.unusedComponents.map(c => c.name),
    expectedUnusedComponents,
    'has proper list of unused components at this stage'
  );
});

test('3.10 + Module Unification - look for unused components and calculate stats', t => {
  let config = {
    appPaths: ['/test-apps/ember_3_10_mu/src/'],
    projectRoot: '/test-apps/ember_3_10_mu/',
    ignore: ['src/ui/routes/application/freestyle.hbs'],
    usePods: false,
    useModuleUnification: true,
    whitelist: ['z-button'],
    searchPaths: ['/test-apps/ember_3_10_mu/src/ui/components'],
  };

  let expectedComponents = [
    'alert',
    'counter',
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

  let expectedUnusedComponents = ['alert', 'max-button', 'user/user-signature'];

  let expectedStats = {
    alert: { name: 'alert', count: 0, curly: 0, angle: 0, js: 0, componentHelper: 0 },
    counter: { name: 'counter', count: 1, curly: 0, angle: 1, js: 0, componentHelper: 0 },
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

  t.deepEqual(
    analyser.components.map(c => c.name),
    expectedComponents,
    'has proper list of components'
  );
  t.deepEqual(
    analyser.unusedComponents.map(c => c.name),
    expectedUnusedComponents,
    'has proper list of unused components'
  );
  t.deepEqual(analyser.stats, expectedStats, 'has properly calculated stats');
});
