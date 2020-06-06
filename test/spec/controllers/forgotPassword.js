'use strict';
/* global readJSON: true */

describe('Controller: ForgotPasswordCtrl', function() {

  beforeEach(module('bsis'));

  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
      $provide.constant('USERCONFIG', readJSON('test/mockData/userconfig.json'));
    });
  });

  var httpBackend;
  var scope;

  beforeEach(inject(function($controller, $rootScope, $httpBackend) {
    scope = $rootScope.$new();

    scope.forgotPasswordForm = {
      $setPristine: angular.noop,
      $setUntouched: angular.noop
    };
    Object.defineProperty(scope.forgotPasswordForm, '$invalid', {
      get: function() {
        // The form is invalid if the username is blank
        return scope.username === '';
      }
    });

    $controller('ForgotPasswordCtrl', {$scope: scope});

    httpBackend = $httpBackend;
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('resetPassword()', function() {

    it('should display an error message if the username is blank', function() {
      scope.resetPassword();

      expect(scope.messageStyle).toBe('danger');
      expect(scope.message).toBe('You need to provide a username');
    });

    it('should make a request and display a success message when the request succeeds', function() {
      spyOn(scope.forgotPasswordForm, '$setPristine');
      spyOn(scope.forgotPasswordForm, '$setUntouched');

      scope.username = 'superuser';

      httpBackend.expectPOST(/\/passwordresets$/, {username: 'superuser'})
        .respond(201);

      scope.resetPassword();
      expect(scope.resetting).toBe(true);
      httpBackend.flush(1);

      expect(scope.resetting).toBe(false);
      expect(scope.username).toBe('');
      expect(scope.forgotPasswordForm.$setPristine).toHaveBeenCalled();
      expect(scope.forgotPasswordForm.$setUntouched).toHaveBeenCalled();
      expect(scope.messageStyle).toBe('success');
      expect(scope.message).toBe('Your password has been reset. Please check your email for the new password.');
    });

    it('should make a request and display an error message when the request fails', function() {
      scope.username = 'nobody';

      httpBackend.expectPOST(/\/passwordresets$/, {username: 'nobody'})
        .respond(404);

      scope.resetPassword();
      expect(scope.resetting).toBe(true);
      httpBackend.flush(1);

      expect(scope.resetting).toBe(false);
      expect(scope.username).toBe('nobody');
      expect(scope.messageStyle).toBe('danger');
      expect(scope.message).toBe('Password reset failed. Please make sure that you have entered the correct username and try again.');
    });
  });
});
