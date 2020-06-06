angular.module('bsis').controller('ViewTestSampleCtrl', function($scope, $location, $routeParams, $timeout, $log, TestingService) {

  // Initial values
  $scope.searching = false;
  $scope.testSample = null;
  $scope.testOutcomes = [];
  $scope.search = {
    donationIdentificationNumber: $routeParams.donationIdentificationNumber || null
  };

  // Find the test sample when the form is submitted
  $scope.findTestSample = function() {
    if ($scope.viewTestSampleForm.$invalid) {
      return;
    }
    $location.search(angular.extend({search: true}, $scope.search));
    $scope.searching = true;
    TestingService.getTestSampleByDIN({donationIdentificationNumber: $scope.search.donationIdentificationNumber}, function(response) {
      $scope.testSample = response.testSample;
      $scope.testOutcomes = response.testSample.testOutcomes;
      $scope.searching = false;
    }, function(err) {
      $log.error(err);
      $scope.testSample = null;
      $scope.testOutcomes = [];
      $scope.searching = false;
    });
  };

  // Clear the search form
  $scope.clear = function() {
    $location.search({});
    $scope.searching = false;
    $scope.testSample = null;
    $scope.testOutcomes = [];
    $scope.search.donationIdentificationNumber = null;
    $scope.viewTestSampleForm.$setPristine();
  };

  if ($routeParams.search) {
    // Defer doing the search until after the form has been loaded
    $timeout(function() {
      $scope.findTestSample();
      $scope.viewTestSampleForm.$setSubmitted();
    });
  }
});
