'use strict';

angular.module('bsis')
  .controller('ConfigurationsCtrl', function($scope, $location, ConfigurationsService, ngTableParams, $timeout, $filter, ICONS) {

    $scope.icons = ICONS;

    var data = [{}];
    $scope.data = data;
    $scope.configurations = {};

    $scope.clear = function() {

    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getConfigurations = function() {
      ConfigurationsService.getConfigurations(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = data;
          $scope.configurations = data;
          $scope.configurationsCount = $scope.configurations.length;

        }
      });
    };

    $scope.configurationsTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 6,          // count per page
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: data.length, // length of data
        getData: function($defer, params) {
          var filteredData = params.filter() ?
            $filter('filter')(data, params.filter()) : data;
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) : data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.configurationsTableParams.reload();
      });
    });

    $scope.addNewConfiguration = function() {
      ConfigurationsService.setConfiguration('');
      $location.path('/manageConfiguration');
    };

    $scope.manageConfiguration = function(configuration) {
      $scope.configuration = configuration;
      ConfigurationsService.setConfiguration(configuration);
      $location.path('/manageConfiguration/' + configuration.id);
    };

    $scope.getConfigurations();

  })

  .controller('ManageConfigurationsCtrl', function($scope, $location, $log, ConfigurationsService, ICONS, DATATYPES, $routeParams) {
    $scope.icons = ICONS;
    $scope.selection = '/manageConfiguration';

    $scope.password = {
      value: ''
    };

    $scope.getConfig = function() {
      ConfigurationsService.getConfigurationById($routeParams.id, function(configuration) {
        $scope.configuration = configuration;
        $scope.disableConfigurationname = true;
      }, function(err) {
        $log.log(err);
      });
    };

    if (!$routeParams.id) {
      $scope.configuration = {};
    } else {
      $scope.getConfig();
      $scope.password.value = '•••••';
    }

    $scope.clearPassword = function() {
      $scope.password.value = $scope.configuration.value;
    };

    $scope.setPassword = function() {
      $scope.configuration.value = $scope.password.value;
    };

    $scope.dataTypes = DATATYPES.options;

    $scope.saveConfiguration = function(configuration, configurationForm) {

      if (configurationForm.$valid) {
        if (angular.isDefined(configuration)) {
          if (angular.isDefined(configuration.id)) {
            $scope.updateConfiguration(configuration, configurationForm);
          } else {
            $scope.addConfiguration(configuration, configurationForm);
          }
        }
      } else {
        $scope.submitted = true;
      }
    };

    $scope.serverError = {};

    $scope.$watch('configuration.dataType.id', function(newValue, oldValue) {
      var indexVal = parseInt(newValue) - 1;
      if (!isNaN(indexVal)) {
        $scope.datatype = DATATYPES.options[indexVal].datatype;
        if (oldValue != null) {
          // Reset the config value
          $scope.configuration.value = null;
          $scope.configurationForm.value.$setPristine();
        }
      }
    });

    $scope.updateConfiguration = function(configuration, configurationForm) {
      if (configurationForm.$valid) {

        $scope.savingConfiguration = true;
        ConfigurationsService.updateConfiguration(configuration, function(response, err) {
          if (response !== false) {
            $scope.go('/configurations');
          } else {

            if (err.value) {
              $scope.configurationValueInvalid = 'ng-invalid';
              $scope.serverError.value = err.value;
            }

            if (err.name) {
              $scope.configurationNameInvalid = 'ng-invalid';
              $scope.serverError.name = err.name;
            }
          }
          $scope.savingConfiguration = false;
        });
      } else {
        $scope.submitted = true;
      }
    };


    $scope.addConfiguration = function(configuration, configurationForm) {

      if (configurationForm.$valid) {
        ConfigurationsService.addConfiguration(configuration, function(response, err) {
          if (response !== false) {
            $scope.configuration = {
              name: '',
              description: ''
            };
            configurationForm.$setPristine();
            $scope.submitted = '';
            $scope.go('/configurations');
          } else {
            if (err.value) {
              $scope.configurationValueInvalid = 'ng-invalid';
              $scope.serverError.value = err.value;
            }

            if (err.name) {
              $scope.configurationNameInvalid = 'ng-invalid';
              $scope.serverError.name = err.name;
            }
          }
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.cancel = function(form) {
      $scope.clearForm(form);
      $location.path('/configurations');
    };


    $scope.go = function(path) {
      $location.path(path);
    };
  });
