'use strict';
/* global readJSON: true */
/* jshint expr: true */

describe('Controller: PackTypesCtrl', function() {

  // load the controller's module
  beforeEach(module('bsis'));


  // setup system & user packType constants
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

    mockData = readJSON('test/mockData/packTypes.json');
    httpBackend = $httpBackend;
    httpBackend.when('GET', new RegExp('.*/packtypes')).respond(mockData);

    createController = function() {
      scope = $rootScope.$new();
      location = $location;

      return $controller('PackTypesCtrl', {$scope: scope, $location: location});
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('*getPackTypes()', function() {

    it('should attach a list of packTypes to the scope', function() {
      httpBackend.expectGET(new RegExp('.*/packtypes'));
      createController();
      httpBackend.flush();
      expect(scope.packTypes.length).toBe(8);
    });

    it('should open the manage packType page to create a new packType', function() {
      httpBackend.expectGET(new RegExp('.*/packtypes'));
      createController();
      httpBackend.flush();

      scope.addNewPackType();
      expect(location.path()).toBe('/managePackType');

    });

    it('should open the manage packType page to edit an existing packType', function() {
      httpBackend.expectGET(new RegExp('.*/packtypes'));
      createController();
      httpBackend.flush();
      scope.managePackType(scope.packTypes[0]);
      expect(location.path()).toBe('/managePackType/1');
      expect(scope.packType.packType).toBe('Single');
      expect(scope.packType.countAsDonation).toBe(true);
      expect(scope.packType.periodBetweenDonations).toBe(90);

    });

  });
});

describe('Controller: ManagePackTypesCtrl', function() {
  // load the controller's module
  beforeEach(module('bsis'));


  // setup system & user packType constants
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

    mockData = readJSON('test/mockData/packTypes.json');
    httpBackend = $httpBackend;
    httpBackend.when('GET', new RegExp('.*/packtypes')).respond(mockData);
    httpBackend.when('GET', new RegExp('.*/componenttypes')).respond(mockData);


    createController = function() {
      scope = $rootScope.$new();
      location = $location;

      return $controller('ManagePackTypesCtrl', {$scope: scope, $location: location});
    };

  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('*savePackType()', function() {

    it('should route to the appropriate method when the form is submitted', function() {
      createController();
      httpBackend.flush();
      spyOn(scope, 'addPackType');
      spyOn(scope, 'updatePackType');

      var packType = {
        isDeleted: false,
        packType: 'Did Not Bleed',
        componentType: null,
        countAsDonation: false,
        periodBetweenDonations: 0,
        canPool: null,
        canSplit: null
      };

      var packTypeForm = {$valid: true};
      scope.savePackType(packType, packTypeForm);
      expect(scope.addPackType).toHaveBeenCalledWith(packType, packTypeForm);

      //Add a packType id, to show that you are editing an existing form
      packType.id = 1;
      scope.savePackType(packType, packTypeForm);
      expect(scope.updatePackType).toHaveBeenCalledWith(packType, packTypeForm);

    });

  });

});