'use strict';
/* jshint expr: true */
/* global readJSON: true */

describe('Service: Authinterceptor', function() {

  beforeEach(module('bsis'));

  beforeEach(function() {
    localStorage.removeItem('auth');
  });

  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
      $provide.constant('USERCONFIG', readJSON('test/mockData/userconfig.json'));
    });
  });

  describe('setCredentials(credentials)', function() {

    it('should store credentials when none exist', inject(function(Authinterceptor) {
      var credentials = 'dXNlcm5hbWU6cGFzc3dvcmQ=';
      Authinterceptor.setCredentials(credentials);

      var storedCredentials = localStorage.getItem('auth');
      expect(storedCredentials).toBe(credentials);
      expect(Authinterceptor.getCredentials()).toBe(credentials);
    }));
  });

  describe('setCredentials(credentials) with exisitng credentials', function() {

    beforeEach(function() {
      localStorage.setItem('auth', 'ZXhpc3Rpbmc6Y3JlZGVudGlhbHM=');
    });

    it('should store overwrite existing credentials', inject(function(Authinterceptor) {
      var credentials = 'dXNlcm5hbWU6cGFzc3dvcmQ=';
      Authinterceptor.setCredentials(credentials);

      var storedCredentials = localStorage.getItem('auth');
      expect(storedCredentials).toBe(credentials);
      expect(Authinterceptor.getCredentials()).toBe(credentials);
    }));
  });

  describe('clearCredentials() with exisitng credentials', function() {

    beforeEach(function() {
      localStorage.setItem('auth', 'ZXhpc3Rpbmc6Y3JlZGVudGlhbHM=');
    });

    it('should clear existing credentials', inject(function(Authinterceptor) {
      Authinterceptor.clearCredentials();

      var storedCredentials = localStorage.getItem('auth');
      expect(storedCredentials).toBe(null);
      expect(Authinterceptor.getCredentials()).toBe(null);
    }));
  });

  describe('request(config) with no credentials', function() {

    it('should not set header', inject(function(Authinterceptor) {
      var config = Authinterceptor.request({
        headers: {}
      });

      expect(config.headers.authorization).toBeUndefined();
    }));
  });

  describe('request(config) with existing credentials', function() {

    beforeEach(function() {
      localStorage.setItem('auth', 'ZXhpc3Rpbmc6Y3JlZGVudGlhbHM=');
    });

    it('should set the authorization header', inject(function(Authinterceptor) {
      var config = Authinterceptor.request({
        headers: {}
      });

      expect(config.headers.authorization).toBe('Basic ZXhpc3Rpbmc6Y3JlZGVudGlhbHM=');
    }));
  });

});
