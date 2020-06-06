'use strict';

angular.module('bsis')

  .filter('slice', function() {
    return function(arr, start, end) {
      return arr.slice(start, end);
    };
  })

  .filter('bsisDate', function($filter, DATEFORMAT) {
    var angularDateFilter = $filter('date');
    return function(theDate) {
      return angularDateFilter(theDate, DATEFORMAT);
    };
  })

  .filter('isoString', function() {
    return function(maybeDate) {
      return angular.isDate(maybeDate) ? maybeDate.toISOString() : maybeDate;
    };
  })

  .filter('bsisDateTime', function($filter, DATETIMEFORMAT) {
    var angularDateFilter = $filter('date');
    return function(theDate) {
      return angularDateFilter(theDate, DATETIMEFORMAT);
    };
  })

  .filter('bsisTime', function($filter, TIMEFORMAT) {
    var angularDateFilter = $filter('date');
    return function(theDate) {
      return angularDateFilter(theDate, TIMEFORMAT);
    };
  })

  .filter('revisionType', function() {
    return function(revisionType) {
      switch (revisionType) {
        case 'ADD':
          return 'Added';

        case 'MOD':
          return 'Modified';

        case 'DEL':
          return 'Deleted';

        default:
          return '';
      }
    };
  })

  .filter('eligibility', function() {
    return function(input) {
      return input ? 'Eligible' : 'Not Eligible';
    };
  })

  .filter('titleCase', function() {
    return function(input) {
      input = input || '';
      input = input.replace(/_/g, ' ');
      return input.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
  })

  .filter('divisionLevel', function(ConfigurationsService) {
    return function(input) {
      return ConfigurationsService.getStringValue('ui.division.level' + input + '.displayName') || 'Unknown level';
    };
  })

  .filter('daysToExpire', function(gettextCatalog) {
    return function(input) {
      return input < 0 ? gettextCatalog.getString('Already expired') : gettextCatalog.getString('{{count}} day(s) to expire', {count: input});
    };
  })
;
