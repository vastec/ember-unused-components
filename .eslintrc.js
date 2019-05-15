'use strict';

module.exports = {
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:node/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    commonjs: true,
    es6: true,
  },
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'error',
  },
};
