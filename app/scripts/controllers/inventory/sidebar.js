'use strict';

angular.module('bsis').controller('InventorySidebarCtrl', function($scope, RoutingService, ICONS) {

  var routes = [
    {
      path: '/findInventory',
      subpaths: []
    }, {
      path: '/viewStockLevels',
      subpaths: []
    }, {
      path: '/manageOrders',
      subpaths: [
        '/fulfilOrder',
        '/viewOrder',
        '/viewOrders'
      ]
    }, {
      path: '/manageReturns',
      subpaths: [
        '/recordReturn',
        '/viewOrder',
        '/viewReturn',
        '/viewReturns'
      ]
    }, {
      path: '/recordTransfusions',
      subpaths: []
    }, {
      path: '/findTransfusion',
      subpaths: []
    }
  ];

  $scope.icons = ICONS;
  $scope.currentPath = RoutingService.getCurrentPath(routes);
});
