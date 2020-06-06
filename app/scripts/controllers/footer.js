angular.module('bsis').controller('FooterCtrl', function($scope, VERSION) {
  $scope.copyrightEndyear = new Date().getFullYear();

  $scope.backendVersion = VERSION.backend.version;
  $scope.backendBuildNumber = VERSION.backend.buildNumber;

  $scope.frontEndVersion = VERSION.frontend.version;
  $scope.frontEndBuildNumber = VERSION.frontend.buildNumber;

});
