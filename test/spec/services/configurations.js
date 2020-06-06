'use strict';
/* global readJSON: true */

describe('Service: Authinterceptor', function() {

  beforeEach(module('bsis'));

  beforeEach(function() {
    module('bsis', function($provide) {
      $provide.constant('SYSTEMCONFIG', readJSON('test/mockData/systemconfig.json'));
      $provide.constant('USERCONFIG', {
        configurations: [
          {
            name: 'string',
            value: 'some string'
          }, {
            name: 'true.boolean',
            value: 'true'
          }, {
            name: 'false.boolean',
            value: 'false'
          }, {
            name: 'uppercase.true.boolean',
            value: 'TRUE'
          }
        ]
      });
    });
  });

  describe('getBooleanValue()', function() {

    it('should return true when the value is "true"', inject(function(ConfigurationsService) {
      var result = ConfigurationsService.getBooleanValue('true.boolean');
      expect(result).toBe(true);
    }));

    it('should return false when the value is "false"', inject(function(ConfigurationsService) {
      var result = ConfigurationsService.getBooleanValue('false.boolean');
      expect(result).toBe(false);
    }));

    it('should return true when the lowercase value is "true"', inject(function(ConfigurationsService) {
      var result = ConfigurationsService.getBooleanValue('uppercase.true.boolean');
      expect(result).toBe(true);
    }));

    it('should return false when the value is not a boolean', inject(function(ConfigurationsService) {
      var result = ConfigurationsService.getBooleanValue('string');
      expect(result).toBe(false);
    }));

    it('should return false when the config does not exist', inject(function(ConfigurationsService) {
      var result = ConfigurationsService.getBooleanValue('not.found');
      expect(result).toBe(false);
    }));
  });
});
