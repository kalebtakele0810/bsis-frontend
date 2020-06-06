'use strict';

angular.module('bsis')
  .factory('RolesService', function($http, Api) {

    var roleObj = {};
    var permissionsObj = {};

    return {

      getRoles: function(response) {
        Api.Roles.get({}, function(apiResponse) {
          response(apiResponse.roles);
        }, function() {
          response(false);
        });
      },

      getAllPermissions: function(response) {
        Api.Permissions.get({}, function(apiResponse) {
          response(apiResponse);
        }, function() {
          response(false);
        });
      },

      getRoleById: function(id, onSuccess, onError) {
        Api.Roles.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse.role);
        }, function(err) {
          onError(err.data);
        });
      },

      updateRole: function(role, response) {

        var updatedRole = angular.copy(role);

        role.permissions.forEach(function(item) {
          updatedRole.permissions.push('' + item.id);
        });

        Api.Roles.update({id: role.id}, role, function(data) {
          roleObj = data.role;
          response(roleObj);
        }, function(err) {
          response(false, err.data);
        });

      },

      addRole: function(role, response) {

        var addRole = new Api.Roles();
        angular.copy(role, addRole);

        addRole.$save(function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });

      },

      removeRole: function(role, response) {
        var apiResponse = Api.Roles.remove({id: role.id}, function() {
          response(apiResponse);
        }, function() {
          response(false);
        });
      },

      setRole: function(role) {
        roleObj = role;
      },

      getRole: function() {
        return roleObj;
      },

      setPermissions: function(permissions) {
        permissionsObj = permissions;
      },

      getPermissions: function() {
        return permissionsObj;
      }

    };
  });
