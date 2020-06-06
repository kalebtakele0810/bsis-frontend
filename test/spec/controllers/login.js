'use strict';
/* global readJSON: true */
/* jshint expr: true */

describe('Controller: LoginCtrl', function() {

  // load the controller's module
  beforeEach(module('bsis'));


  // setup system & user config constants
  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
      $provide.constant('USERCONFIG', readJSON('test/mockData/userconfig.json'));
    });
  });


  // instantiate service
  //var _AuthService_, httpBackend;
  var scope, createController, httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $httpBackend) {

    // reset localStorage session variable
    localStorage.removeItem('consoleSession');

    httpBackend = $httpBackend;

    httpBackend.when('GET', new RegExp('.*/users/login-user-details')).respond(readJSON('test/mockData/superuser.json'));
    httpBackend.when('GET', new RegExp('.*/configurations')).respond(readJSON('test/mockData/userconfig.json'));

    createController = function() {
      scope = $rootScope.$new();
      return $controller('LoginCtrl', {$scope: scope});
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });


  // Testing the login() function
  describe('*login()', function() {

    // process the createUserSession() function and throw no user profile found error
    it('should run the login() and successfully login a valid user', function() {
      createController();

      var credentials = {username: 'superuser', password: 'superuser'};
      var loginForm = {
        $valid: true, $setPristine: function() {
        }
      };

      // run the login function
      scope.login(credentials, loginForm);
      httpBackend.flush();

      // loginAlert should be undefined and loginInvalid should be false
      expect(scope.loginAlert).toBe(undefined);
      expect(scope.loginInvalid).toBe(false);
    });

    it('should run the login() and reject login - loginAlert exists', function() {
      createController();

      var credentials = {username: 'superuser', password: ''};
      var loginForm = {
        $valid: false, $setPristine: function() {
        }
      };

      // run the login function
      scope.login(credentials, loginForm);

      // loginAlert should have a message and loginInvalid should be true
      expect(scope.loginAlert).toBe('Please supply all fields');
      expect(scope.loginInvalid).toBe(true);
    });

  });

});
