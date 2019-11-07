Test apps
------------------------------------------------------------------------------

Every test app had its purpose. There is more to test with higher versions that introduce new syntax and configuration options.

## 3.10 + Module Unification

- module unification structure (this is an experimental feature so we are looking for `EMBER_MODULE_UNIFICATION` in features in `environment.js`)
- curly braces components
- angle brackets components
- nested angle brackets components (out of the box in 3.10, no polyfill required)

## LTS 3.8 Octane

- classic structure (at some point Module Unification was a part of Octane but [it's not anymore](https://blog.emberjs.com/2019/03/11/update-on-module-unification-and-octane.html) )
- curly braces components
- angle brackets components (new test for this statement: "Single word component names are completely OK in angle bracket form")

## Ember Addon 3.13

- classic addon structure

## LTS 3.4 With Addons

- classic structure
- two addons installed in node_modules, one with components, one without

## LTS 3.4 Mixed Pods

- combined structure—some components as pods, some classic components
- curly braces components
- angle brackets components
- nested angle brackets components (supported via [ember-angle-bracket-invocation-polyfill](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill))

## LTS 3.4 POD without `podModulePrefix` set

- PODs structure (we use guessing algorithm to understand that)
- curly braces components
- angle brackets components
- nested angle brackets components (supported via [ember-angle-bracket-invocation-polyfill](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill))

## LTS 3.4

- classic structure
- curly braces components
- angle brackets components
- nested angle brackets components (supported via [ember-angle-bracket-invocation-polyfill](https://github.com/rwjblue/ember-angle-bracket-invocation-polyfill))
  - polyfill works since Ember 2.12 but officially angle brackets components are supported since version 3.4 so that's the version where we start writing tests for it
  - polyfill is not needed since Ember 3.10
  - that doesn't change the behavior of the script as it doesn't check if you use Ember version or polyfill that supports the feature

## LTS 2.18 POD

- PODs structure
- curly braces components

## LTS 2.18

- classic structure
- curly braces components

## Development

It's handy to use these apps as a reference when developing a feature of fixing a bug. Use them by specifying `--path`:

```bash
$ ./index.js --path="/test-apps/ember_lts_3_4_pod_no_prefix/" --stats
```
