'use strict';
/* global readJSON: true */
/* jshint expr: true */

describe('Controller: ConfigurationsCtrl', function() {

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
  var scope, createController, httpBackend, location, mockData;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $httpBackend, $location) {

    mockData = readJSON('test/mockData/generalConfigs.json');
    httpBackend = $httpBackend;
    httpBackend.when('GET', new RegExp('.*/configurations')).respond(mockData);
    httpBackend.when('GET', new RegExp('.*/configurations/1')).respond(mockData[0]);

    createController = function() {
      scope = $rootScope.$new();
      location = $location;

      return $controller('ConfigurationsCtrl', {$scope: scope, $location: location});
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('*getConfigurations()', function() {

    it('should attach a list of configurations to the scope', function() {
      httpBackend.expectGET(new RegExp('.*/configurations'));
      createController();
      httpBackend.flush();
      expect(scope.configurations.length).toBe(6);
    });

    it('should open the manage config page to create a new config', function() {
      httpBackend.expectGET(new RegExp('.*/configurations'));

      createController();
      httpBackend.flush();

      scope.addNewConfiguration();
      expect(location.path()).toBe('/manageConfiguration');

    });

    it('should open the manage config page to edit an existing config', function() {
      httpBackend.expectGET(new RegExp('.*/configurations'));
      createController();
      httpBackend.flush();
      scope.manageConfiguration(scope.configurations[0]);

      expect(location.path()).toBe('/manageConfiguration/1');

      expect(scope.configuration.name).toBe('donation.bpSystolicMax');
      expect(scope.configuration.description).toBe('Blood Pressure systolic value cannot be more than 250');
      expect(scope.configuration.value).toBe('250');
      expect(scope.configuration.dataType.id).toBe(2);
      expect(scope.configuration.dataType.datatype).toBe('integer');

    });

  });
});

describe('Controller: ManageConfigurationsCtrl', function() {
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
  var scope, createController, httpBackend, location, mockData;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $httpBackend, $location) {

    mockData = readJSON('test/mockData/generalConfigs.json');
    httpBackend = $httpBackend;
    httpBackend.when('GET', new RegExp('.*/configurations')).respond(mockData);
    httpBackend.when('GET', new RegExp('.*/configurations/1')).respond(mockData[0]);


    createController = function() {
      scope = $rootScope.$new();
      location = $location;

      return $controller('ManageConfigurationsCtrl', {$scope: scope, $location: location});
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('*saveConfiguration()', function() {

    it('should route to the appropriate method when the form is submitted', function() {
      createController();


      spyOn(scope, 'addConfiguration');
      spyOn(scope, 'updateConfiguration');

      var configuration = {
        name: 'name',
        description: 'description',
        value: 'value',
        dataType: {
          id: 1,
          datatype: 'text'
        }
      };

      var configurationForm = {$valid: true};
      scope.saveConfiguration(configuration, configurationForm);
      expect(scope.addConfiguration).toHaveBeenCalledWith(configuration, configurationForm);

      //Add a configuration id, to show that you are editing an existing form
      configuration.id = 1;
      scope.saveConfiguration(configuration, configurationForm);
      expect(scope.updateConfiguration).toHaveBeenCalledWith(configuration, configurationForm);

    });

  });

});