'use strict';

module.exports = {
  /**
   * Checks if file has any angle brackets invocation of given component
   *
   * Angle brackets components:
   *  - <XButton/>
   *  - <MiniButton></MiniButton>
   *  - <User::UserCard/>
   *
   * @param {string} data - text file
   * @param {string} component - the name of component
   * @returns {boolean}
   */
  angleBrackets(data, component) {
    component = _convertToAngleBracketsName(component);

    let re = new RegExp(`<${component}($|\\s|\\r|/>|>)`, 'gi');

    // console.log('component:', component);
    return data.match(re) && data.match(re).length > 0;
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
   * @returns {boolean}
   */
  curlyBraces(data, component) {
    let re = new RegExp(`${component}($|\\s|\\r|/|}}|'|"|\`)`, 'gi');

    return data.match(re) && data.match(re).length > 0;
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
