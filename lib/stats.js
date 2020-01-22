'use strict';

module.exports = {
  /**
   * Counts using `component "component-name"` usage in templates
   *
   * @param {object} components
   * @returns {number}
   */
  countComponentHelpers(components) {
    let count = 0;

    for (const key of Object.keys(components)) {
      count += components[key].stats.componentHelper;
    }

    return count;
  },

  /**
   * Counts components invocations in JS files.
   * That could happen through `import` or by referring by name in configuration of an script or so.
   *
   * @param {object} components
   * @returns {number}
   */
  countJsUsage(components) {
    let count = 0;

    for (const key of Object.keys(components)) {
      count += components[key].stats.js;
    }

    return count;
  },

  /**
   * Counts components that were used just once.
   *
   * @param {object} components
   * @returns {number}
   */
  countUsedJustOnce(components) {
    let count = 0;

    for (const key of Object.keys(components)) {
      if (components[key].stats.count === 1) {
        count++;
      }
    }

    return count;
  },

  /**
   * Creates a breakdown between {{curly-braces}} and <AngleBrackets> components syntax usage.
   *
   * @param {object} components
   * @returns {{curly: number, angle: number, curlyPercentage: number, anglePercentage: number}}
   */
  curlyVsAngle(components) {
    let curly = 0;
    let angle = 0;
    let total;

    for (const key of Object.keys(components)) {
      curly += components[key].stats.curly;
      angle += components[key].stats.angle;
    }

    total = curly + angle;

    return {
      curly,
      curlyPercentage: (curly / total) * 100,
      angle,
      anglePercentage: (angle / total) * 100,
    };
  },

  /**
   * Returns the most used component. The one for which we found the highest number of occurrences.
   *
   * In case of the same number of occurrences for multiple component, the first on the list is returned.
   *
   * @param {object} components
   * @returns {object|null}
   */
  getTheMostCommon(components) {
    let max = null;

    for (const key of Object.keys(components)) {
      if (!max || max.stats.count < components[key].stats.count) {
        max = components[key];
      }
    }

    return max;
  },
};
