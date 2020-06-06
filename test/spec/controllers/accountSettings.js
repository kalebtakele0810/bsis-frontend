'use strict';
/* global readJSON: true */

describe('Controller: AccountSettingsCtrl', function() {

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

    scope.userDetailsForm = {
      $setPristine: angular.noop,
      $setUntouched: angular.noop
    };

    $controller('AccountSettingsCtrl', {$scope: scope});

    httpBackend = $httpBackend;
    $httpBackend.expectGET(/\/users\/login-user-details$/).respond(200, readJSON('test/mockData/superuser.json'));
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('initial load', function() {

    it('should update the master details', function() {
      httpBackend.flush(1);

      expect(scope.masterDetails.firstName).toBe('Super');
      expect(scope.masterDetails.lastName).toBe('User');
      expect(scope.masterDetails.emailId).toBe('xxxx@jembi.org');
      expect(scope.masterDetails.username).toBe('superuser');
      expect(scope.masterDetails.modifyPassword).toBe(false);
      expect(scope.masterDetails.currentPassword).toBe('');
      expect(scope.masterDetails.password).toBe('');
      expect(scope.masterDetails.confirmPassword).toBe('');
    });

    it('should reset the user details', function() {
      spyOn(scope, 'resetUserDetails');

      httpBackend.flush(1);

      expect(scope.resetUserDetails).toHaveBeenCalled();
    });

    it('should display an error when fetching the logged on user fails', function() {
      httpBackend.resetExpectations();
      httpBackend.expectGET(/\/users\/login-user-details$/).respond(500);

      httpBackend.flush(1);

      expect(scope.detailsStyle).toBe('danger');
      expect(scope.detailsMessage).toBe('Loading details failed. Please try refreshing');
    });
  });

  describe('resetUserDetails()', function() {

    beforeEach(function() {
      httpBackend.flush(1);
    });

    it('should clear the message', function() {
      scope.detailsMessage = 'Failure message';

      scope.resetUserDetails();

      expect(scope.detailsMessage).toBeNull();
    });

    it('should reset the state of the form', function() {
      spyOn(scope.userDetailsForm, '$setPristine');
      spyOn(scope.userDetailsForm, '$setUntouched');

      scope.resetUserDetails();

      expect(scope.userDetailsForm.$setPristine).toHaveBeenCalled();
      expect(scope.userDetailsForm.$setUntouched).toHaveBeenCalled();
    });

    it('should set the user details back to their initial state', function() {
      scope.userDetails.firstName = 'Test';
      scope.userDetails.lastName = 'Tester';
      scope.userDetails.emailId = 'test@jembi.org';
      scope.userDetails.username = 'testuser';
      scope.userDetails.modifyPassword = true;
      scope.userDetails.currentPassword = 'oldPassword';
      scope.userDetails.password = 'test';
      scope.userDetails.confirmPassword = 'test';

      scope.resetUserDetails();

      expect(scope.userDetails.firstName).toBe('Super');
      expect(scope.userDetails.lastName).toBe('User');
      expect(scope.userDetails.emailId).toBe('xxxx@jembi.org');
      expect(scope.userDetails.username).toBe('superuser');
      expect(scope.userDetails.modifyPassword).toBe(false);
      expect(scope.userDetails.currentPassword).toBe('');
      expect(scope.userDetails.password).toBe('');
      expect(scope.userDetails.confirmPassword).toBe('');
    });
  });

  describe('updateUserDetails()', function() {

    beforeEach(function() {
      httpBackend.flush(1);
    });

    it('should display an error message if the form is invalid', function() {
      scope.userDetailsForm.$invalid = true;

      scope.updateUserDetails();

      expect(scope.detailsStyle).toBe('danger');
      expect(scope.detailsMessage).toBe('Please complete all of the required fields');
    });

    it('should update the user details and display a message on success', inject(function(AuthService) {
      spyOn(scope, 'resetUserDetails');
      spyOn(AuthService, 'setLoggedOnUser');

      scope.userDetails.lastName = 'Tester';

      httpBackend.expectPUT(/\/users$/, scope.userDetails).respond(200, scope.userDetails);

      scope.updateUserDetails();
      httpBackend.flush(1);

      expect(scope.masterDetails.lastName).toBe('Tester');
      expect(scope.resetUserDetails).toHaveBeenCalled();
      expect(scope.detailsStyle).toBe('success');
      expect(scope.detailsMessage).toBe('Your details were successfully updated');
      expect(AuthService.setLoggedOnUser).toHaveBeenCalled();
    }));

    it('should update the credentials when the password is changed', inject(function(Authinterceptor, Base64) {
      spyOn(Authinterceptor, 'setCredentials');

      scope.userDetails.modifyPassword = true;
      scope.userDetails.password = 'newPassword';
      scope.userDetails.confirmPassword = 'newPassword';

      httpBackend.expectPUT(/\/users$/, scope.userDetails).respond(200, scope.userDetails);

      scope.updateUserDetails();
      httpBackend.flush(1);

      var credentials = Base64.encode('superuser:newPassword');
      expect(Authinterceptor.setCredentials).toHaveBeenCalledWith(credentials);
    }));

    it('should display an error message on failure', function() {

      httpBackend.expectPUT(/\/users$/, scope.userDetails).respond(503, 'Service Unavailable');

      scope.updateUserDetails();
      httpBackend.flush(1);

      expect(scope.detailsStyle).toBe('danger');
      expect(scope.detailsMessage).toBe('Updating details failed. Please try again');
    });

    it('should display the returned error message when updating the password fails', function() {

      httpBackend.expectPUT(/\/users$/, scope.userDetails).respond(400, {
        'user.password': 'Current password does not match'
      });

      scope.updateUserDetails();
      httpBackend.flush(1);

      expect(scope.detailsStyle).toBe('danger');
      expect(scope.detailsMessage).toBe('Current password does not match');
    });
  });
});
