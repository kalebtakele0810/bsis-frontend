'use strict';

angular.module('bsis')
  .factory('AuthService', function($http, $rootScope, AUTH_EVENTS, ROLES, Api, Authinterceptor, Base64) {

    var loggedOnUser = angular.fromJson(localStorage.getItem('loggedOnUser'));
    var session = angular.fromJson(localStorage.getItem('consoleSession'));

    /**
     * Create a new session from the logged on user's details and persist it to localStorage.
     */
    function refreshSession() {
      var currentTime = new Date().getTime();
      var expiryTime = new Date(currentTime + (1000 * 60 * 60));

      // iterate through the user's roles and associated permissions, and populate the session permissions
      var permissions = [];
      for (var roleIndex in loggedOnUser.roles) {
        var role = loggedOnUser.roles[roleIndex];
        for (var permissionIndex in role.permissions) {
          var permission = role.permissions[permissionIndex];
          // if the permission is not already in the session permissions array, add it to the array
          if (permissions.indexOf(permission.name) < 0) {
            permissions.push(permission.name);
          }
        }
      }

      var firstName = loggedOnUser.firstName || '';
      var lastName = loggedOnUser.lastName || '';
      var fullName = firstName + ' ' + lastName;

      session = {
        sessionUser: loggedOnUser.username,
        sessionUserName: fullName,
        sessionUserPermissions: permissions,
        expires: expiryTime.getTime()
      };

      $rootScope.displayHeader = true;
      $rootScope.sessionUserName = session.sessionUserName;
      $rootScope.sessionUserPermissions = session.sessionUserPermissions;

      localStorage.setItem('consoleSession', angular.toJson(session));
    }

    function setLoggedOnUser(user) {
      $rootScope.user = user;
      loggedOnUser = user;
      localStorage.setItem('loggedOnUser', angular.toJson(loggedOnUser));
      refreshSession();
    }

    function clearLoggedOnUser() {
      loggedOnUser = null;
      session = null;
      localStorage.removeItem('loggedOnUser');
      localStorage.removeItem('consoleSession');
    }

    return {

      login: function(loginCredentials, onSuccess, onError) {
        var encodedCredentials = Base64.encode(loginCredentials.username + ':' + loginCredentials.password);
        $http.defaults.headers.common.authorization = 'Basic ' + encodedCredentials;
        Api.User.get({}, function(user) {

          setLoggedOnUser(user);
          Authinterceptor.setCredentials(encodedCredentials);

          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

          onSuccess(user);
        }, function(error) {

          $rootScope.user = {};
          $rootScope.displayHeader = false;
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);

          onError(error.status);
        });
      },

      logout: function() {
        clearLoggedOnUser();
        Authinterceptor.clearCredentials();

        $http.defaults.headers.common.authorization = '';

        $rootScope.user = {
          id: '',
          userId: '',
          role: ROLES.guest
        };
        $rootScope.displayHeader = false;
        $rootScope.sessionUserName = '';
        $rootScope.sessionUserPermissions = '';
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      },

      getSession: function() {
        return session;
      },

      refreshSession: function() {
        refreshSession();
      },

      getLoggedOnUser: function() {
        return loggedOnUser;
      },
      hasPermission: function(permission) {
        if (session != null) {
          if (session.sessionUserPermissions.indexOf(permission) != -1) {
            return true;
          }
        }
        return false;
      },
      setLoggedOnUser: function(user) {
        setLoggedOnUser(user);
      },

      // Only for testing
      __setLoggedOnUser: function(user) {
        loggedOnUser = user;
      }
    };
  });
