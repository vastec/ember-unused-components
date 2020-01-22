import test from 'ava';
const utils = require('../../lib/utils');
const analyser = require('../../lib/analyser');
const stats = require('../../lib/stats');

function setup() {
  let commandOptions = { path: '/test-apps/ember_lts_3_4_with_addons/', includeAddons: true };
  let config = utils.getConfig(commandOptions);
  analyser.mapComponents(config);
  analyser.scanProject(config);
  analyser.respectWhitelist(config.whitelist);

  return analyser.components;
}

test('it calculates most common component', t => {
  let components = setup();
  let common = stats.getTheMostCommon(components);
  t.is(common.key, 'y-button');
  t.is(common.stats.count, 7);
});

test('it calculates most curly vs bracket breakdown', t => {
  let components = setup();

  let breakdown = stats.curlyVsAngle(components);
  t.deepEqual(breakdown, {
    curly: 10,
    curlyPercentage: 45.45454545454545,
    angle: 12,
    anglePercentage: 54.54545454545454,
  });
});
