'use strict';
/* global readJSON: true */

describe('Service: Utils', function() {

  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
    });
  });

  describe('dateSort()', function() {
    it('should return -1 when date1 is before date2', inject(function(UtilsService) {
      var date2 = new Date();
      var date1 = new Date(date2.getTime() - (1000 * 60 * 60)).getTime();
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(-1);
    }));

    it('should return -1 when date2 is null', inject(function(UtilsService) {
      var date1 = new Date();
      var date2 = null;
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(-1);
    }));

    it('should return 1 when date1 is after date2', inject(function(UtilsService) {
      var date1 = new Date();
      var date2 = new Date(date1.getTime() - (1000 * 60 * 60)).getTime();
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(1);
    }));

    it('should return 1 when date1 is null', inject(function(UtilsService) {
      var date1 = null;
      var date2 = new Date();
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(1);
    }));

    it('should return 0 when date1 is equals to date2', inject(function(UtilsService) {
      var date1 = new Date();
      var date2 = angular.copy(date1);
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(0);
    }));

    it('should return 0 when date1 and date 2 are null', inject(function(UtilsService) {
      var date1 = null;
      var date2 = null;
      var result = UtilsService.dateSort(date1, date2);
      expect(result).toBe(0);
    }));

  });
});