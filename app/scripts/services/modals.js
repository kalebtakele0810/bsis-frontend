'use strict';

angular.module('bsis')
  .factory('ModalsService', function($uibModal) {
    return {
      showConfirmation: function(confirmObject) {
        var modalInstance = $uibModal.open({
          animation: false,
          templateUrl: 'views/confirmModal.html',
          controller: 'ConfirmModalCtrl',
          resolve: {
            confirmObject: confirmObject
          }
        });
        return modalInstance.result;
      }
    };
  });
