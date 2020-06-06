'use strict';

angular.module('bsis').controller('AuditLogCtrl', function($scope, $filter, $q, Api, ngTableParams, gettextCatalog, DATEFORMAT) {

  function unwindRevisions(revisions) {
    var mapped = [];

    angular.forEach(revisions, function(revision) {

      angular.forEach(revision.entityModifications, function(modification) {

        mapped.push({
          id: revision.id,
          revisionDate: revision.revisionDate,
          user: revision.user,
          revisionType: modification.revisionType,
          entityName: modification.entityName
        });
      });
    });

    return mapped;
  }

  function groupModifications(revisions) {
    var grouped = [];

    angular.forEach(revisions, function(revision) {

      var match = false;
      angular.forEach(grouped, function(group) {
        if (!match &&
          revision.id === group.id &&
          revision.entityName === group.entityName &&
          revision.revisionType === group.revisionType) {
          match = true;
          group.count += 1;
        }
      });

      if (!match) {
        grouped.push(angular.extend({count: 1}, revision));
      }
    });

    return grouped;
  }

  $scope.dateFormat = DATEFORMAT;

  $scope.dateRange = {
    startDate: moment().subtract(7, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  var unwatch = $scope.$watch('dateRange', function() {
    if ($scope.dateRange.startDate && $scope.dateRange.endDate) {
      $scope.tableParams.$params.page = 1;
      $scope.tableParams.reload();
    }
  }, true);

  $scope.$on('$destroy', function() {
    unwatch();
  });

  $scope.getRevisionTypes = function() {
    var deferred = $q.defer();
    deferred.resolve([
      {
        id: 'ADD',
        title: gettextCatalog.getString('Added')
      },
      {
        id: 'MOD',
        title: gettextCatalog.getString('Modified')
      },
      {
        id: 'DEL',
        title: gettextCatalog.getString('Deleted')
      }
    ]);
    return deferred;
  };

  $scope.tableParams = new ngTableParams({
    page: 1,
    count: 10,
    sorting: {
      revisionDate: 'desc'
    }
  }, {
    counts: [],
    getData: function($defer, params) {

      var endDate = $scope.dateRange.endDate;

      var query = {
        startDate: $filter('isoString')($scope.dateRange.startDate),
        endDate: $filter('isoString')(endDate)
      };

      var filter = angular.copy(params.filter() || {});
      if (filter.user) {
        query.search = filter.user;
      }
      delete filter.user;

      Api.AuditRevisions.query(query, function(auditRevisions) {
        // Transform
        var data = groupModifications(unwindRevisions(auditRevisions));

        // Filter
        data = $filter('filter')(data, filter);

        // Sort
        if (params.sorting()) {
          data = $filter('orderBy')(data, params.orderBy());
        }

        // Set total number of rows for pagination
        params.total(data.length);

        // Page
        $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }, $defer.reject);
    }
  });
});
