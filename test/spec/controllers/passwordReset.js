'use strict';
/* global readJSON: true */

describe('Controller: PasswordResetCtrl', function() {

  beforeEach(module('bsis'));

  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
    });
  });

  var scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();

    $controller('PasswordResetCtrl', {
      $scope: scope
    });
  }));

  describe('setPassword()', function() {

    it('should do nothing if the form is invalid', inject(function(AuthService, UsersService) {
      spyOn(AuthService, 'getLoggedOnUser').and.callFake(function() {
        return readJSON('test/mockData/superuser.json');
      });
      spyOn(UsersService, 'updateLoggedOnUser');

      scope.setPassword({
        passwordResetForm: {
          $invalid: true
        }
      });

      expect(UsersService.updateLoggedOnUser).not.toHaveBeenCalled();
    }));

    it('should redirect to the login page if there is no logged on user', inject(function($location, AuthService, UsersService) {
      spyOn(AuthService, 'getLoggedOnUser').and.callFake(function() {
        return null;
      });
      spyOn(UsersService, 'updateLoggedOnUser');
      spyOn($location, 'path');

      scope.setPassword({
        passwordResetForm: {
          $invalid: false
        }
      });

      expect(UsersService.updateLoggedOnUser).not.toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('/login');
    }));

    it('should display an error message on error', inject(function($location, AuthService, UsersService) {
      spyOn(AuthService, 'getLoggedOnUser').and.callFake(function() {
        return readJSON('test/mockData/superuser.json');
      });
      spyOn(UsersService, 'updateLoggedOnUser').and.callFake(function(update, onSuccess, onError) {
        expect(update.modifyPassword).toBe(true);
        expect(update.password).toBe('newPassword');
        expect(update.confirmPassword).toBe('newPassword');
        onError();
      });
      spyOn($location, 'path');

      var childScope = {
        passwordResetForm: {
          $invalid: false
        },
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      };
      scope.setPassword(childScope);

      expect(UsersService.updateLoggedOnUser).toHaveBeenCalled();
      expect($location.path).not.toHaveBeenCalled();
      expect(childScope.errorMessage).toBe('Setting your new password failed. Please try again.');
    }));

    it('should close the modal on success', inject(function($location, AuthService, UsersService) {
      spyOn(AuthService, 'getLoggedOnUser').and.callFake(function() {
        return readJSON('test/mockData/superuser.json');
      });
      spyOn(UsersService, 'updateLoggedOnUser').and.callFake(function(update, onSuccess) {
        expect(update.modifyPassword).toBe(true);
        expect(update.password).toBe('newPassword');
        expect(update.confirmPassword).toBe('newPassword');
        onSuccess();
      });
      spyOn($location, 'path');

      scope.setPassword({
        passwordResetForm: {
          $invalid: false
        },
        newPassword: 'newPassword',
        confirmPassword: 'newPassword'
      });

      expect(UsersService.updateLoggedOnUser).toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('/home');
    }));
  });
});
