import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  columns: computed(function() {
    return [
      {
        label: 'Name #1',
        valuePath: 'name1',
        cellComponent: 'user/user-something',
        component: 'y-button',
      },
      {
        label: 'Name #1 B',
        valuePath: 'name1b',
        // prettier-ignore
        cellComponent:'user/user-something',
        // prettier-ignore
        component:'y-button'
      },
      {
        label: 'Name #2',
        valuePath: 'name2',
        // prettier-ignore
        cellComponent: "user/user-something",
        // prettier-ignore
        component: "y-button"
      },
      {
        label: 'Name #2 B',
        valuePath: 'name2b',
        // prettier-ignore
        cellComponent:"user/user-something",
        // prettier-ignore
        component:"y-button"
      },
      {
        label: 'Name #3',
        valuePath: 'name3',
        // prettier-ignore
        cellComponent: `user/user-something`,
        // prettier-ignore
        component: `y-button`
      },
      {
        label: 'Name #3 C',
        valuePath: 'name3c',
        // prettier-ignore
        cellComponent:`user/user-something`,
        // prettier-ignore
        component:`y-button`
      },
    ];
  }),
});

/*
  *** TEST CASE - find ***

  Testing support for `ember-light-table` and its way to define `cellComponent` or `component`.
*/
