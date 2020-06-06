'use strict';

angular.module('bsis').controller('LabellingSidebarCtrl', function($scope, RoutingService, ICONS) {

  var routes = [
    {
      path: '/findSafeComponents',
      subpaths: []
    },
    {
      path: '/labelComponents',
      subpaths: []
    }
  ];

  $scope.icons = ICONS;
  $scope.currentPath = RoutingService.getCurrentPath(routes);
});
