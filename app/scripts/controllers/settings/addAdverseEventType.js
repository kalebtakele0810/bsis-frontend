'use strict';

angular.module('bsis').controller('AddAdverseEventTypeCtrl', function($scope, $location, $log, AdverseEventsService) {

  $scope.adverseEventType = {
    name: '',
    description: '',
    isDeleted: false
  };

  $scope.forms = {};

  $scope.$watch('adverseEventType.name', function() {
    if (!$scope.forms.adverseEventTypeForm) {
      return;
    }
    $scope.forms.adverseEventTypeForm.name.$setValidity('duplicate', true);
  });

  $scope.saveAdverseEventType = function(form) {
    if (form.$invalid) {
      return;
    }

    var adverseEventType = {
      name: $scope.adverseEventType.name,
      description: $scope.adverseEventType.description,
      isDeleted: $scope.adverseEventType.isDeleted
    };

    $scope.savingAdverseEventType = true;
    AdverseEventsService.createAdverseEventType(adverseEventType, function() {
      $location.path('/adverseEventTypes');
    }, function(response) {
      if (response.data && response.data.name) {
        form.name.$setValidity('duplicate', false);
      } else {
        $log.error(response);
      }
      $scope.savingAdverseEventType = false;
    });
  };
});
