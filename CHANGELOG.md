# ember-unused-components CHANGELOG

## `master` (to release)

**MAINTENANCE:**
- ([#20](https://github.com/vastec/ember-unused-components/pull/20)) [Security] Bump lodash.merge from `4.6.1` to `4.6.2`
- ([#22](https://github.com/vastec/ember-unused-components/pull/20)) [Security] Bump lodash from `4.17.11` to `4.17.15`
- ([#21](https://github.com/vastec/ember-unused-components/pull/20)) Bump eslint from `5.16.0` to `6.2.1`
- ([#25](https://github.com/vastec/ember-unused-components/pull/20)) Bump yargs from `13.2.4` to `14.0.0`
- ([#23](https://github.com/vastec/ember-unused-components/pull/20)) Bump ava from `2.1.0` to `2.3.0`
- ([#24](https://github.com/vastec/ember-unused-components/pull/20)) Bump fs-extra from `8.0.1` to `8.1.0`
- ([#19](https://github.com/vastec/ember-unused-components/pull/20)) Bump eslint-config-prettier from `4.3.0` to `6.1.0`

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
