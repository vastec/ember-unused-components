import test from 'ava';

const objectInfo = require('../../lib/object-info');

test('it converts component paths to names and types correctly', t => {
  let config = {
    addonPaths: ['/node_modules/company_buttons'],
    includeAddons: true,
  };

  let nameConversions = {
    'max-button': [
      '/system/path/example-app/app/components/max-button.js',
      '/system/path/example-app/app/components/max-button/component.js',
      '/system/path/example-app/app/components/max-button/template.hbs',
      '/system/path/example-app/addon/components/max-button/component.js',
      '/system/path/example-app/addon/components/max-button/template.hbs',
      '/system/path/example-app/addon/components/max-button.js',
      '/system/path/example-app/node_modules/company-buttons/addon/components/max-button/component.js',
      '/system/path/example-app/node_modules/company-buttons/addon/components/max-button/template.hbs',
      '/system/path/example-app/node_modules/company-buttons/addon/components/max-button.js',
    ],
  };

  Object.keys(nameConversions).forEach(name => {
    nameConversions[name].forEach(path => {
      let info = objectInfo.get(config, path);
      t.is(info.name, name, `${path} should yield correct name`);
      t.is(info.type, 'component', `${path} should yield correct type`);
    });
  });
});

test('it gets addon info correctly', t => {
  let config = {
    addonPaths: ['/node_modules/company-buttons'],
    includeAddons: true,
  };

  let withAddon = [
    '/system/path/example-app/node_modules/company-buttons/addon/components/max-button/component.js',
    '/system/path/example-app/node_modules/company-buttons/addon/components/max-button/template.hbs',
    '/system/path/example-app/node_modules/company-buttons/addon/components/max-button.js',
  ];

  let withoutAddon = [
    '/system/path/example-app/app/components/max-button.js',
    '/system/path/example-app/app/components/max-button/component.js',
    '/system/path/example-app/app/components/max-button/template.hbs',
    '/system/path/example-app/addon/components/max-button/component.js',
    '/system/path/example-app/addon/components/max-button/template.hbs',
    '/system/path/example-app/addon/components/max-button.js',
  ];

  withAddon.forEach(path => {
    let info = objectInfo.get(config, path);

    t.is(info.addonName, 'company-buttons', `${path} should yield correct source name`);
    t.is(
      info.addonPath,
      '/node_modules/company-buttons',
      `${path} should yield correct source path`
    );
  });

  withoutAddon.forEach(path => {
    let info = objectInfo.get(config, path);
    t.is(info.addonName, undefined, `${path} should not have source name`);
    t.is(info.addonPath, undefined, `${path} should not have source path`);
  });
});
