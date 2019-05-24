# ember-unused-components CHANGELOG

## 1.0.0

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

**Maintenance:**
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
