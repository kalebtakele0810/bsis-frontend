'use strict';

angular.module('bsis')
  .controller('RolesCtrl', function($scope, $location, RolesService, ICONS, $filter, ngTableParams, $timeout) {

    $scope.icons = ICONS;
    $scope.data = {};
    var data = [];
    $scope.roles = {};

    $scope.clear = function() {

    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getRoles = function() {
      RolesService.getRoles(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = response;
          $scope.rolesCount = $scope.data.length;
        }
      });

      $scope.rolesTableParams = new ngTableParams({
        page: 1,            // show first page
        count: 6,          // count per page
        filter: {},
        sorting: {}
      },
        {
          defaultSort: 'asc',
          counts: [], // hide page counts control
          total: $scope.data.length, // length of data
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
          $scope.rolesTableParams.reload();
        });
      });
    };

    $scope.addNewRole = function() {
      RolesService.setRole('');
      RolesService.setPermissions('');
      $location.path('/manageRole');
    };


    $scope.manageRole = function(role) {

      RolesService.getAllPermissions(function(response) {
        if (response !== false) {
          $scope.permissionList = response.permissions;
          RolesService.setPermissions(response.permissions);
          $scope.role = role;
          RolesService.setRole(role);
          $location.path('/manageRole/' + role.id);
        }
      });
    };

    $scope.getRoles();

  })

  .controller('ManageRolesCtrl', function($scope, $location, RolesService, ICONS, $routeParams) {
    $scope.icons = ICONS;

    $scope.saveRole = function(role, roleForm) {
      $scope.permissionsRequired = false;
      if (angular.isDefined(role) && angular.isDefined(role.permissions) && role.permissions.length > 0) {
        if ($scope.manageRoleType === 'updateRole') {
          $scope.updateRole(role);
        } else if ($scope.manageRoleType === 'addRole') {
          $scope.addRole(role, roleForm);
        }
      } else {
        $scope.submitted = true;
        $scope.permissionsRequired = true;
      }
    };

    $scope.addRole = function(role, roleForm) {

      if (roleForm.$valid) {
        $scope.savingRole = true;
        RolesService.addRole(role, function(response, err) {
          if (response !== false) {
            $scope.role = {
              name: '',
              description: ''
            };
            roleForm.$setPristine();
            $scope.submitted = '';
            $scope.go('/roles');
          } else {
            $scope.nameInvalid = 'ng-invalid';
            $scope.err = err.fieldErrors.name[0].code;
          }
          $scope.savingRole = false;
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.go = function(path) {
      $location.path(path);
    };

    $scope.someSelected = function(object) {
      return Object.keys(object).some(function(key) {
        return object[key];
      });
    };

    $scope.updateRole = function(role) {

      $scope.savingRole = true;
      RolesService.updateRole(role, function(response, err) {
        if (response !== false) {
          RolesService.setRole('');
          RolesService.setPermissions('');
          $location.path('/roles');
        } else {
          $scope.nameInvalid = 'ng-invalid';
          var name = 'name';
          $scope.serverError = err[name];
        }
        $scope.savingRole = false;
      });
    };

    $scope.loadPermissions = function() {
      RolesService.getAllPermissions(function(response) {
        if (response !== false) {
          $scope.permissionList = response.permissions;
        }
      });
    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.cancel = function(form) {
      $scope.clearForm(form);
      $location.path('/roles');
    };


    $scope.getRole = function() {
      RolesService.getRoleById($routeParams.id, function(role) {
        $scope.role = role;
        $scope.loadPermissions();
      }, function(err) {
        $scope.err = err;
      });
    };

    // managing addition of new role
    if (!$routeParams.id) {
      $scope.role = {
        permissions: []
      };
      $scope.loadPermissions();
      $scope.manageRoleType = 'addRole';
    } else {
      // managing update of existing role
      $scope.getRole();
      $scope.manageRoleType = 'updateRole';
    }

  });
