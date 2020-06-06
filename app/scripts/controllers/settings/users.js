'use strict';

angular.module('bsis')
  .controller('UsersCtrl', function($scope, $location, UsersService, RolesService, ICONS, $filter, ngTableParams, $timeout) {

    $scope.icons = ICONS;

    $scope.isCurrent = function(path) {
      if (path.length > 1 && $location.path().substr(0, path.length) === path) {
        $location.path(path);
        $scope.selection = path;
        return true;
      } else if ($location.path() === path) {
        return true;
      } else {
        return !!($location.path() === '/settings' && path === '/users');
      }
    };

    var data = [];
    $scope.data = data;
    $scope.users = {};

    $scope.clear = function() {

    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getUsers = function() {
      UsersService.getUsers(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = data;
          $scope.usersCount = $scope.data.length;
        }
      });

    };


    $scope.getUsers();

    $scope.removeUserCheck = function(user) {
      $scope.userToRemove = user.id;
    };

    $scope.cancelRemoveUser = function() {
      $scope.userToRemove = '';
    };

    $scope.removeUser = function(user) {
      user.isDeleted = true;
      UsersService.deleteUser(user, function(response) {
        if (response !== false) {
          $scope.getUsers();
          $location.path('/users');
        }
      });
    };

    $scope.addNewUser = function() {
      UsersService.setUser('');
      $location.path('/manageUser');
    };

    $scope.manageUser = function(item) {

      $scope.user = item;
      UsersService.setUser(item);

      RolesService.getRoles(function(response) {
        if (response !== false) {
          $scope.roleList = response;
          UsersService.setRoles(response);
          $location.path('/manageUser/' + item.id);
        }
      });
    };


    $scope.usersTableParams = new ngTableParams({
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
        $scope.usersTableParams.reload();
      });
    });
  })
  .controller('ManageUserCtrl', function($scope, $rootScope, UsersService, RolesService, ICONS, $location, ngTableParams, $timeout, $routeParams, $log) {
    $scope.icons = ICONS;
    $scope.selection = '/manageUser';

    $scope.getUser = function() {
      UsersService.getUserById($routeParams.id, function(user) {
        $scope.user = user;
        $scope.disableUsername = true;
        //Reset permissions in object
        for (var roleIndex in $scope.user.roles) {
          $scope.user.roles[roleIndex].permissions = [];
        }
      }, function(err) {
        $log.error(err);
      });
    };


    if (!$routeParams.id) {
      $scope.user = {};
      $scope.user.modifyPassword = true;
      $scope.emailRequired = 'required';
      $scope.passwordRequired = 'required';
    } else {
      $scope.getUser();
    }


    $scope.saveUser = function(user, userForm) {
      if (userForm.$valid) {
        $scope.roleRequired = false;
        if (angular.isDefined(user) && angular.isDefined(user.roles) && user.roles.length > 0) {
          if (angular.isDefined(user.id)) {
            $scope.updateUser(user, userForm);
          } else {
            $scope.addUser(user, userForm);
          }
        } else {
          $scope.roleRequired = true;
        }
      } else {
        $scope.submitted = true;
      }
    };

    RolesService.getRoles(function(list) {
      $scope.roleList = list;
      //Reset permissions in object
      for (var roleIndex in $scope.roleList) {
        $scope.roleList[roleIndex].permissions = [];
      }

    });

    $scope.updateUser = function(user, userForm) {
      if (userForm.$valid) {

        $scope.savingUser = true;
        UsersService.updateUser(user, function(response, err) {
          if (response !== false) {
            $scope.go('/users');
          } else {
            var fieldName = 'username';
            if (err[fieldName]) {
              $scope.usernameInvalid = 'ng-invalid';
              $scope.serverError = err[fieldName];
            }
          }
          $scope.savingUser = false;
        });
      } else {
        $scope.submitted = true;
      }
    };


    $scope.addUser = function(user, userForm) {

      if (userForm.$valid) {
        $scope.savingUser = true;
        UsersService.addUser(user, function(response, err) {
          if (response !== false) {
            $scope.user = {
              name: '',
              description: ''
            };
            userForm.$setPristine();
            $scope.submitted = '';
            $scope.go('/users');
          } else {
            var fieldName = 'username';
            if (err[fieldName]) {
              $scope.usernameInvalid = 'ng-invalid';
              $scope.serverError = err[fieldName];
              $scope.err = err.fieldErrors.username[0].code;
            }
          }
          $scope.savingUser = false;
        });
      } else {
        $scope.submitted = true;
      }
    };

    //$scope.loadRoles();

    $scope.go = function(path) {
      $location.path(path);
    };
  })
;
