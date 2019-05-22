'use strict';

module.exports = {
  /**
   * Checks if file has any angle brackets invocation of given component
   *
   * Angle brackets components:
   *  - <Alert>
   *  - <XButton/>
   *  - <MiniButton></MiniButton>
   *  - <User::UserCard/>
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {{regex: string, match: undefined|array }}
   */
  angleBrackets(data, component) {
    component = _convertToAngleBracketsName(component);

    let regex = `<${component}($|\\s|\\r|/>|>)`;
    return _prepareResult(data, regex);
  },

  /**
   * Checks if file has any usage of a component via `component` helper
   *
   * Examples:
   *  -
   *    {{yield (hash
   *      generic-form=(component "contact-form")
   *    )}}
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {{regex: string, match: undefined|array }}
   */
  componentHelper(data, component) {
    let regex = `component\\s('|")${component}('|")`;
    return _prepareResult(data, regex);
  },

  /**
   * Looks for component's occurrences in HBS file
   *
   * Strategies:
   *  - search for {{curly-braces}} components (see: `curlyBraces` method)
   *  - search for <AngleBrackets> components (see: `angleBrackets` method)
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {object}
   */
  componentLookupInHbs(data, component) {
    let curlyBracesInvocation = this.curlyBraces(data, component);
    let angleBracketsInvocation = this.angleBrackets(data, component);
    let usesComponentHelper = this.componentHelper(data, component);

    if (curlyBracesInvocation.match) {
      return {
        fileType: 'hbs',
        type: 'curly',
        lines: this.getLines(data, component, curlyBracesInvocation.regex),
      };
    }

    if (angleBracketsInvocation.match) {
      return {
        fileType: 'hbs',
        type: 'angle',
        lines: this.getLines(data, component, angleBracketsInvocation.regex),
      };
    }

    if (usesComponentHelper.match) {
      return {
        fileType: 'hbs',
        type: 'componentHelper',
        lines: this.getLines(data, component, usesComponentHelper.regex),
      };
    }
  },

  /**
   * Looks for component's occurrences in JS file
   *
   * Strategies:
   *  - search for imports (see: `importedInJs` method)
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {object}
   */
  componentLookupInJs(data, component) {
    let importedInJs = this.importedInJs(data, component);
    let usedAsCellComponent = this.usedAsCellComponent(data, component);

    if (importedInJs.match) {
      return {
        fileType: 'js',
        type: 'import',
        lines: this.getLines(data, component, importedInJs.regex),
      };
    }

    if (usedAsCellComponent.match) {
      return {
        fileType: 'js',
        type: 'elt',
        lines: this.getLines(data, component, usedAsCellComponent.regex),
      };
    }
  },

  /**
   * Checks if file has any curly braces invocation of given component
   *
   * Curly braces components:
   *  - {{x-button}}
   *  - {{mini-button}}
   *  - {{user/user-card}}
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {{regex: string, match: undefined|array }}
   */
  curlyBraces(data, component) {
    let regex = `({{|{{#)${component}($|\\s|\\r|/|}}|'|"|\`)`;
    return _prepareResult(data, regex);
  },

  /**
   * Returns lines of component's occurrence
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @param {string} regex - regex that was used for checking component's occurrence
   * @returns {array}
   */
  getLines(data, component, regex) {
    let re = new RegExp(`(.*${regex}.*)`, 'gi');

    return data.match(re).map(l => l.trim());
  },

  /**
   * Checks if file has any import statements for a component
   *
   * Import examples:
   *  - import XButton from 'ember-lts-2-18/components/x-button';
   *  - import XButton from 'ember-lts-2-18-pod/modules/components/x-button/component';
   *
   * It should ignore other "name occurrences" of a component:
   *  - className: ['user/user-signature'],
   *  - // this is some comment in js about 'user/user-signature'
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {{regex: string, match: undefined|array }}
   */
  importedInJs(data, component) {
    let regex = `/${component}(/component)?('|"|\`)`;
    return _prepareResult(data, regex);
  },

  /**
   * Checks if file is using `ember-light-table` syntax for specifying `cellComponent`
   *
   * Examples:
   *  - cellComponent: 'user/user-something',
   *  - cellComponent: "user/user-something",
   *  - cellComponent: `user/user-something`,
   *  - cellComponent:'user/user-something',
   *  - cellComponent:"user/user-something",
   *  - cellComponent:`user/user-something`,
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {{regex: string, match: undefined|array }}
   */
  usedAsCellComponent(data, component) {
    let regex = `(cellComponent|component):\\s?('|"|\`)${component}('|"|\`)`;
    return _prepareResult(data, regex);
  },
};

/**
 * Converts curly brackets name of component into angle brackets.
 *
 * Examples:
 *  - `x-button` into `XButton`
 *  - `mini-button` into `MiniButton`
 *  - `user/user-card` into `User::UserCard`
 *
 * @param {string} component - component's name
 * @returns {string}
 * @private
 */
function _convertToAngleBracketsName(component) {
  let nestedParts = component.split('/');

  nestedParts = nestedParts.map(nestedPart => {
    let hasHyphenAsFirstCharacter = nestedPart.charAt(0) === '-';
    let localParts = nestedPart.split('-');

    localParts = localParts.map(_uppercaseFirstLetter);

    let localName = localParts.join('');

    return hasHyphenAsFirstCharacter ? `-${localName}` : localName;
  });

  return nestedParts.join('::');
}

/**
 * Prepares results for a lookup.
 *
 * Lookup is based on given regex but the form it informs about an occurrence is the same
 * for all lookup strategies.
 *
 * @param {string} data - text file
 * @param {string} regex - lookup strategy's regex
 * @returns {{regex: string, match: undefined|array }}
 * @private
 */
function _prepareResult(data, regex) {
  let re = new RegExp(regex, 'gi');
  let match = data.match(re);

  let result = { regex };

  if (match && match.length > 0) {
    result.match = match;
  }
  return result;
}

/**
 * Looks for first letter, not char! and uppercases it
 *
 * @param {string} string
 * @returns {string}
 * @private
 */
function _uppercaseFirstLetter(string) {
  let stringArr = string.split('');

  for (let i = 0; i < stringArr.length; i++) {
    if (/^[a-zA-Z]+$/.test(stringArr[i])) {
      stringArr[i] = stringArr[i].toUpperCase();
      break;
    }
  }
  return stringArr.join('');
}
