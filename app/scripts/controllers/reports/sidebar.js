'use strict';

angular.module('bsis')
  .controller('ReportsSidebarCtrl', function($scope, RoutingService, ICONS) {

    var routes = [
      {
        path: '/aboRhGroupsReport',
        subpaths: []
      },
      {
        path: '/donationTypesReport',
        subpaths: []
      },
      {
        path: '/ttiPrevalenceReport',
        subpaths: []
      },
      {
        path: '/bloodUnitsIssuedReport',
        subpaths: []
      },
      {
        path: '/donorsDeferredReport',
        subpaths: []
      },
      {
        path: '/unitsDiscardedReport',
        subpaths: []
      },
      {
        path: '/componentsProducedReport',
        subpaths: []
      },
      {
        path: '/donorsAdverseEventsReport',
        subpaths: []
      },
      {
        path: '/transfusionsReport',
        subpaths: []
      }
    ];

    $scope.icons = ICONS;
    $scope.currentPath = RoutingService.getCurrentPath(routes);
  });
