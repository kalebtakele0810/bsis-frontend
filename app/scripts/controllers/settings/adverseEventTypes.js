'use strict';

angular.module('bsis').controller('AdverseEventTypesCtrl', function($scope, $filter, $location, $log, ICONS, AdverseEventsService, ngTableParams) {

  $scope.icons = ICONS;

  $scope.tableParams = new ngTableParams({
    page: 1,
    count: 6
  }, {
    counts: [],
    getData: function($defer, params) {

      AdverseEventsService.getAdverseEventTypes(function(adverseEventTypes) {
        var orderedData = params.sorting() ?
          $filter('orderBy')(adverseEventTypes, params.orderBy()) : adverseEventTypes;
        params.total(orderedData.length);
        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }, function(err) {
        $log.error(err);
        $defer.reject(err);
      });
    }
  });

  $scope.editAdverseEventType = function(id) {
    $location.path('/editAdverseEventType/' + id);
  };
});
