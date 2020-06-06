'use strict';

angular.module('bsis')
  .controller('AccountSettingsCtrl', function($scope, UsersService, gettextCatalog) {

    $scope.masterDetails = {
      firstName: '',
      lastName: '',
      emailId: '',
      username: '',
      modifyPassword: false,
      currentPassword: '',
      password: '',
      confirmPassword: ''
    };

    $scope.userDetails = {};

    // Reset user details to their initial state
    $scope.resetUserDetails = function() {
      $scope.userDetails = angular.copy($scope.masterDetails);
      $scope.detailsMessage = null;
      if ($scope.userDetailsForm) {
        // If the form exists, reset it
        $scope.userDetailsForm.$setPristine();
        $scope.userDetailsForm.$setUntouched();
      }
    };

    // Update user details on form submission
    $scope.updateUserDetails = function() {
      if ($scope.userDetailsForm.$invalid) {
        $scope.detailsStyle = 'danger';
        $scope.detailsMessage = gettextCatalog.getString('Please complete all of the required fields');
        return;
      }

      // Update the user details
      $scope.updatingUser = true;
      UsersService.updateLoggedOnUser($scope.userDetails, function(updatedUser) {
        $scope.masterDetails = updatedUser;
        $scope.resetUserDetails();
        $scope.detailsStyle = 'success';
        $scope.detailsMessage = gettextCatalog.getString('Your details were successfully updated');
        $scope.updatingUser = false;
      }, function(response) {
        $scope.detailsStyle = 'danger';
        if (response.data && response.data['user.password']) {
          $scope.detailsMessage = response.data['user.password'];
        } else {
          $scope.detailsMessage = gettextCatalog.getString('Updating details failed. Please try again');
        }
        $scope.updatingUser = false;
      });
    };

    // Fetch user details
    UsersService.getLoggedOnUser(function(response) {
      angular.extend($scope.masterDetails, response, {
        modifyPassword: false,
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
      $scope.resetUserDetails();
    }, function() {
      $scope.detailsStyle = 'danger';
      $scope.detailsMessage = gettextCatalog.getString('Loading details failed. Please try refreshing');
    });

  });
