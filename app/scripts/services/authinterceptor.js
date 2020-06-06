'use strict';

angular.module('bsis')
  .factory('Authinterceptor', function() {

    var credentials = localStorage.getItem('auth');

    return {

      setCredentials: function(newCredentials) {
        credentials = newCredentials;
        localStorage.setItem('auth', credentials);
      },

      clearCredentials: function() {
        credentials = null;
        localStorage.removeItem('auth');
      },

      getCredentials: function() {
        return credentials;
      },

      request: function(config) {

        if (!credentials) {
          return config;
        }

        config.headers.authorization = 'Basic ' + credentials;
        return config;
      }
    };
  }).config(function($httpProvider) {
    $httpProvider.interceptors.push('Authinterceptor');
  });
