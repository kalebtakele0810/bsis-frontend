'use strict';

angular.module('bsis')
  .factory('UsersService', function($http, Api, Authinterceptor, AuthService, Base64) {
    var rolesObj = {};
    var userObj = {};
    return {

      getUsers: function(response) {
        Api.Users.get({}, function(apiResponse) {
          response(apiResponse.users);
        }, function() {
          response(false);
        });
      },

      getUserById: function(id, onSuccess, onError) {
        Api.Users.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse.user);
        }, function(err) {
          onError(err.data);
        });
      },


      addUser: function(user, response) {
        var addUser = new Api.Users();
        angular.copy(user, addUser);

        addUser.$save(function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      },

      updateUser: function(user, response) {
        var updatedUser = angular.copy(user);
        Api.Users.update({id: user.id}, updatedUser, function(data) {
          userObj = data.role;
          response(userObj);
        }, function(err) {
          response(false, err.data);
        });

      },

      deleteUser: function(user, response) {
        var deleteUser = new Api.Users();
        angular.copy(user, deleteUser);

        deleteUser.$delete({id: user.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });

      },

      setUser: function(user) {
        userObj = user;
      },

      getUser: function() {
        return userObj;
      },

      setRoles: function(roles) {
        rolesObj = roles;
      },

      getRoles: function() {
        return rolesObj;
      },

      getLoggedOnUser: function(onSuccess, onError) {
        return Api.User.get(onSuccess, onError);
      },

      updateLoggedOnUser: function(user, onSuccess, onError) {
        var update = angular.copy(user);

        // Delete fields added by angular
        delete update.$promise;
        delete update.$resolved;

        // Make API call
        return Api.Users.update({}, update, function(updatedUser) {

          // Update the reference to the logged on user
          AuthService.setLoggedOnUser(updatedUser);

          if (update.modifyPassword) {
            // Update stored credentials
            var credentials = Base64.encode(updatedUser.username + ':' + update.password);
            Authinterceptor.setCredentials(credentials);
          }

          onSuccess.apply(this, arguments);
        }, onError);
      }

    };
  });
