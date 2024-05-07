# ember-unused-components CHANGELOG

## On `master`, to release

- nothing yet

## 1.2.2 (May 7, 2024)

**FIX:**
- [#190](https://github.com/vastec/ember-unused-components/pull/190) Fixed ignored files not being ignored

**MAINTENANCE:**
- [#191](https://github.com/vastec/ember-unused-components/pull/191) Update package-lock.json

## 1.2.1 (August 2, 2023)

**FEATURES:**
- [#189](https://github.com/vastec/ember-unused-components/pull/189) Support typescript files and component colocation

## 1.2.0 (January 28, 2020)

**FEATURES:**
- [#52](https://github.com/vastec/ember-unused-components/pull/52) [EXPERIMENTAL] - Search for unused components from addons :fire: Maybe you don't need that addon anymore? 

**REFACTOR:**
- [#52](https://github.com/vastec/ember-unused-components/pull/52) Improvements to components detection + internal restructuring that sets things in the right direction for future development

Special thanks to @jkeen for his huge work on the refactor and the experimental feature!

**MAINTENANCE:**
- ([#39](https://github.com/vastec/ember-unused-components/pull/39)) Bump ava from `2.3.0` to `2.4.0`
- ([#42](https://github.com/vastec/ember-unused-components/pull/42)) Bump colors from `1.3.3` to `1.4.0`
- ([#43](https://github.com/vastec/ember-unused-components/pull/43), [#61](https://github.com/vastec/ember-unused-components/pull/61)) Bump eslint-plugin-prettier from `3.1.0` to `3.1.2`
- ([#45](https://github.com/vastec/ember-unused-components/pull/45), [#65](https://github.com/vastec/ember-unused-components/pull/65)) Bump yargs from `14.0.0` to `15.1.0`
- ([#48](https://github.com/vastec/ember-unused-components/pull/48), [#62](https://github.com/vastec/ember-unused-components/pull/62)) Bump eslint from `6.3.0` to `6.8.0`
- ([#49](https://github.com/vastec/ember-unused-components/pull/49), [#64](https://github.com/vastec/ember-unused-components/pull/64)) Bump eslint-config-prettier from `6.2.0` to `6.9.0`
- ([#63](https://github.com/vastec/ember-unused-components/pull/63)) Bump eslint-plugin-node from `10.0.0` to `11.0.0`

## 1.1.0 (September 10, 2019)

Although, there are no breaking changes this version is released as a new minor version (not a patch version). It introduces a new option (`failOnUnused`) which is switched off by default but in general can be dangerous for some projects. The package files were reduced so it also introduces some danger here.

**FEATURES:**

- ([#31](https://github.com/vastec/ember-unused-components/pull/31)) New option `failOnUnused` which throws and error when unused components were found (useful for CI) 

**MAINTENANCE:**
- ([#32](https://github.com/vastec/ember-unused-components/pull/32)) Bump eslint from `6.2.2` to `6.3.0`
- ([#33](https://github.com/vastec/ember-unused-components/pull/33) [#36](https://github.com/vastec/ember-unused-components/pull/36)) Bump eslint-plugin-node from `9.1.0` to `10.0.0`
- ([#34](https://github.com/vastec/ember-unused-components/pull/34)) Improve a hint how to use tests-app in development
- ([#35](https://github.com/vastec/ember-unused-components/pull/34)) Bump eslint-config-prettier from `6.1.0` to `6.2.0`
- ([#38](https://github.com/vastec/ember-unused-components/pull/38)) Specify library files in package.json - npm package size reduced from 2.2MB to 42.1kB (unpacked)

## 1.0.4 (August 27, 2019)

**MAINTENANCE:**
- ([#19](https://github.com/vastec/ember-unused-components/pull/19)) Bump eslint-config-prettier from `4.3.0` to `6.1.0`
- ([#20](https://github.com/vastec/ember-unused-components/pull/20)) [Security] Bump lodash.merge from `4.6.1` to `4.6.2`
- ([#21](https://github.com/vastec/ember-unused-components/pull/21) [#28](https://github.com/vastec/ember-unused-components/pull/28)) Bump eslint from `5.16.0` to `6.2.2`
- ([#22](https://github.com/vastec/ember-unused-components/pull/22)) [Security] Bump lodash from `4.17.11` to `4.17.15`
- ([#23](https://github.com/vastec/ember-unused-components/pull/23)) Bump ava from `2.1.0` to `2.3.0`
- ([#24](https://github.com/vastec/ember-unused-components/pull/24)) Bump fs-extra from `8.0.1` to `8.1.0`
- ([#25](https://github.com/vastec/ember-unused-components/pull/25)) Bump yargs from `13.2.4` to `14.0.0`
- ([#26](https://github.com/vastec/ember-unused-components/pull/26)) Bump prettier from `1.17.1` to `1.18.2`
- ([#29](https://github.com/vastec/ember-unused-components/pull/29)) [Security] Bump eslint-utils from `1.3.1` to `1.4.2`

## 1.0.3 (June 26, 2019)

**FIX:**
- Support POD structure when `podModulePrefix` is empty

## 1.0.2 (June 5, 2019)

**FIX:**
- Prepared to be run in an empty project (no usage in percentage calculations etc...)

**MAINTENANCE:**
- Dependencies upgrade: `colors@1.3.3`, `fs-extra@8.0.1`, `ava@2.0.0`, `eslint-config-prettier@4.3.0`, `eslint-plugin-node@9.1.0`
  
## 1.0.1 (May 24, 2019)

**FIX:**
- `ember-addon` removed from `keywords` in `package.json` to prevent ember from running `index.js` on startup

## 1.0.0 (May 24, 2019)

**COMPLETE REWRITE:**

This is no longer an Ember addon but a NodeJS command-line script. The reasons for changing the approach were:
- It's faster than `ember-cli` interface.
- It gives more freedom when it comes to testing. Finally, we have multiple Ember app instances with a different configuration for testing purposes.
That gives us more confidence when introducing changes.

**FEATURES:**

- Support for `<AngleBrackets>` components (also nested ones, e.g. `<User::UserCard/>`)
- Support for `ember-light-table`'s way of defining `cellComponent: 'component-name'` and `component: 'component-name'`
- Support for `(component "component-name")` helper used in templates
- Support for Module Unification structure
- Show percentage of unused components in the report
- Stats module that shows:
  - The most used component
  - The number of components used just once
  - Usage of `{{curly-braces}}` vs `<AngleBrackets>` syntax
  - Usage of (component "component-name") helper in templates
  - Usage in JS files (e.g. through `import` or ELT)
- Show occurrences of a component (use `--occurrences` or `--o` argument). Example:
```
user/user-card:

 > ./app/templates/application.hbs
  - {{user/user-card}}
```

**MAINTENANCE:**
- Running Travis CI

## 0.2.0 (June 29, 2018)

**BUG FIXES:**

- Better match mechanism for finding component occurrences

## 0.1.1 (June 5, 2018)

**FEATURES:**

- Support non-pods structure

**BUG FIXES:**

- The proper command name for ember help

**MAINTENANCE:**

- Dependencies Upgrade: ember-cli@3.1.4

## 0.1.0 (May 24, 2018)

**FEATURES:**

- Configuration: Ignore files in search for component's usage

## 0.0.1 (May 15, 2018)

- core functionality with: 
  - POD support
  - whitelist support
