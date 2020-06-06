'use strict';

angular.module('bsis')
  .controller('PasswordResetCtrl', function($scope, $location, UsersService, AuthService) {

    $scope.setPassword = function(scope) {

      if (scope.passwordResetForm.$invalid) {
        // Don't update
        return;
      }

      var user = AuthService.getLoggedOnUser();

      if (!user) {
        $location.path('/login');
        return;
      }

      // Update the user details
      var update = angular.copy(user);
      update.modifyPassword = true;
      update.password = scope.newPassword;
      update.confirmPassword = scope.confirmPassword;

      UsersService.updateLoggedOnUser(update, function() {
        $location.path('/home');
      }, function() {
        scope.errorMessage = 'Setting your new password failed. Please try again.';
      });
    };
  });
