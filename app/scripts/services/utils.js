'use strict';

angular.module('bsis')
  .factory('UtilsService', function() {
    return {
      dateSort: function(date1, date2) {
        if (date1 === null && date2 === null) {
          return 0; // equal and null
        } else if (date2 === null || (date1 !== null && date1 < date2)) {
          return -1; // if date2 is null it's consider larger than date1
        } else if (date1 === null || date1 > date2) {
          return 1; // if date1 is null it's consider larger than date2
        } else {
          return 0; // equal and not null
        }
      }
    };
  });
