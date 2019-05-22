import Component from '@ember/component';

export default Component.extend({
  className: ['user/user-signature'],
});

/*
  `className` above is a false friend when it comes to searching for the usage of `user/user-signature` component.

  It should not be counted as an occurrence of a component.
*/
