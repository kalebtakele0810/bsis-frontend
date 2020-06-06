angular.module('bsis').controller('DonorsSidebarCtrl', function($scope, RoutingService, ICONS) {

  var routes = [
    {
      path: '/findDonor',
      subpaths: [
        '/viewDonor',
        '/addDonor'
      ]
    }, {
      path: '/duplicateDonors',
      subpaths: [
        '/manageDuplicateDonors'
      ]
    }, {
      path: '/manageDonationBatches',
      subpaths: [
        '/manageClinic'
      ]
    }, {
      path: '/donorCounselling',
      subpaths: []
    }, {
      path: '/exportDonorList',
      subpaths: []
    }
  ];

  $scope.icons = ICONS;
  $scope.currentPath = RoutingService.getCurrentPath(routes);
});
