'use strict';

angular.module('bsis').controller('EditAdverseEventTypeCtrl', function($scope, $location, $log, $routeParams, AdverseEventsService) {

  $scope.adverseEventType = {
    id: $routeParams.id,
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

  AdverseEventsService.getAdverseEventTypeById($routeParams.id, function(adverseEventType) {
    $scope.adverseEventType = adverseEventType;
  }, function(err) {
    $log.error(err);
  });

  $scope.saveAdverseEventType = function(form) {
    if (form.$invalid) {
      return;
    }

    var adverseEventType = {
      id: $scope.adverseEventType.id,
      name: $scope.adverseEventType.name,
      description: $scope.adverseEventType.description,
      isDeleted: $scope.adverseEventType.isDeleted
    };

    $scope.savingAdverseEventType = true;
    AdverseEventsService.updateAdverseEventType(adverseEventType, function() {
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
