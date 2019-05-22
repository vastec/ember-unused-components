'use strict';

module.exports = {
  /**
   * Counts using `component "component-name"` usage in templates
   *
   * @param {object} stats
   * @returns {number}
   */
  countComponentHelpers(stats) {
    let count = 0;

    for (const key of Object.keys(stats)) {
      count += stats[key].componentHelper;
    }

    return count;
  },

  /**
   * Counts components invocations in JS files.
   * That could happen through `import` or by referring by name in configuration of an script or so.
   *
   * @param {object} stats
   * @returns {number}
   */
  countJsUsage(stats) {
    let count = 0;

    for (const key of Object.keys(stats)) {
      count += stats[key].js;
    }

    return count;
  },

  /**
   * Counts components that were used just once.
   *
   * @param {object} stats
   * @returns {number}
   */
  countUsedJustOnce(stats) {
    let count = 0;

    for (const key of Object.keys(stats)) {
      if (stats[key].count === 1) {
        count++;
      }
    }

    return count;
  },

  /**
   * Creates a breakdown between {{curly-braces}} and <AngleBrackets> components syntax usage.
   *
   * @param {object} stats
   * @returns {{curly: number, angle: number, curlyPercentage: number, anglePercentage: number}}
   */
  curlyVsAngle(stats) {
    let curly = 0;
    let angle = 0;
    let total;

    for (const key of Object.keys(stats)) {
      curly += stats[key].curly;
      angle += stats[key].angle;
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
   * @param {object} stats
   * @returns {object|null}
   */
  getTheMostCommon(stats) {
    let max = null;

    for (const key of Object.keys(stats)) {
      if (!max || max.count < stats[key].count) {
        max = stats[key];
      }
    }

    return max;
  },
};
