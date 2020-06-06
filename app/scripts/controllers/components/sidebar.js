'use strict';

angular.module('bsis').controller('ComponentsSidebarCtrl', function($scope, RoutingService, ICONS) {

  var routes = [
    {
      path: '/recordComponents',
      subpaths: []
    }, {
      path: '/findComponents',
      subpaths: []
    }, {
      path: '/discardComponents',
      subpaths: []
    }, {
      path: '/findDiscards',
      subpaths: []
    }, {
      path: '/receiveComponents',
      subpaths: [
        '/addComponentBatch',
        '/viewComponentBatch',
        '/viewComponentBatches'
      ]
    }
  ];

  $scope.icons = ICONS;
  $scope.currentPath = RoutingService.getCurrentPath(routes);
});
