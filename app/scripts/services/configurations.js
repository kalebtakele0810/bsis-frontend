'use strict';

angular.module('bsis')
  .factory('ConfigurationsService', function($http, Api, $filter, USERCONFIG, UI, DONATION) {

    var configurationObj = {};
    return {

      getConfigurations: function(response) {
        Api.Configurations.get({}, function(apiResponse) {
          USERCONFIG = apiResponse;
          response(apiResponse.configurations);
        }, function() {
          response(false);
        });
      },

      getConfigurationById: function(id, onSuccess, onError) {
        Api.Configurations.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse);
        }, function(err) {
          onError(err.data);
        });
      },

      setConfiguration: function(configuration) {
        configurationObj = configuration;
      },

      getConfiguration: function() {
        return configurationObj;
      },

      addConfiguration: function(configuration, response) {
        var addConfiguration = new Api.Configurations();
        angular.copy(configuration, addConfiguration);

        addConfiguration.$save(function(data) {
          response(data);
          //$window.location.reload();
        }, function(err) {
          response(false, err.data);
        });

      },

      updateConfiguration: function(configuration, response) {

        var updatedConfiguration = angular.copy(configuration);
        var config = [];
        Api.Configurations.update({id: configuration.id}, updatedConfiguration, function(data) {
          configurationObj = data.configuration;
          response(configurationObj);
          config.push(updatedConfiguration);

          for (var i = 0, tot = config.length; i < tot; i++) {
            if (config[i].name == 'dateFormat') {
              angular.module('bsis').constant('DATEFORMAT', config[i].value);
            } else if (config[i].name == 'dateTimeFormat') {
              angular.module('bsis').constant('DATETIMEFORMAT', config[i].value);
            } else if (config[i].name == 'timeFormat') {
              angular.module('bsis').constant('TIMEFORMAT', config[i].value);
            }

            //Home Tabs constants

            // else if (config[i].name == 'ui.donorsTabEnabled'){
            //   UI.DONORS_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.componentsTabEnabled'){
            //   UI.COMPONENTS_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.testingTabEnabled'){
            //   UI.TESTING_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.labellingTabEnabled'){
            //   UI.LABELLING_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.inventoryTabEnabled'){
            //   UI.INVENTORY_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.reportsTabEnabled'){
            //   UI.REPORTS_TAB_ENABLED = config[i].value;
            // }
            // else if (config[i].name == 'ui.mobileClinicTabEnabled'){
            //   UI.MOBILE_CLINIC_TAB_ENABLED = config[i].value;
            // }


            // Donor form units
            if (config[i].name == 'donation.bpUnit') {
              DONATION.BPUNIT = config[i].value;
            } else if (config[i].name == 'donation.hbUnit') {
              DONATION.HBUNIT = config[i].value;
            } else if (config[i].name == 'donation.weightUnit') {
              DONATION.WEIGHTUNIT = config[i].value;
            } else if (config[i].name == 'donation.pulseUnit') {
              DONATION.PULSEUNIT = config[i].value;
            }          // donor form constants

            if (config[i].name == 'donation.donor.bpSystolicMin') {
              DONATION.DONOR.BP_SYSTOLIC_MIN = config[i].value;
            } else if (config[i].name == 'donation.donor.bpSystolicMax') {
              DONATION.DONOR.BP_SYSTOLIC_MAX = config[i].value;
            } else if (config[i].name == 'donation.donor.bpDiastolicMin') {
              DONATION.DONOR.BP_DIASTOLIC_MIN = config[i].value;
            } else if (config[i].name == 'donation.donor.bpDiastolicMax') {
              DONATION.DONOR.BP_DIASTOLIC_MAX = config[i].value;
            } else if (config[i].name == 'donation.donor.hbMin') {
              DONATION.DONOR.HB_MIN = config[i].value;
            } else if (config[i].name == 'donation.donor.hbMax') {
              DONATION.DONOR.HB_MAX = config[i].value;
            } else if (config[i].name == 'donation.donor.weightMin') {
              DONATION.DONOR.WEIGHT_MIN = config[i].value;
            } else if (config[i].name == 'donation.donor.weightMax') {
              DONATION.DONOR.WEIGHT_MAX = config[i].value;
            } else if (config[i].name == 'donation.donor.pulseMin') {
              DONATION.DONOR.PULSE_MIN = config[i].value;
            } else if (config[i].name == 'donation.donor.pulseMax') {
              DONATION.DONOR.PULSE_MAX = config[i].value;
            }
          }
        }, function(err) {
          response(false, err.data);
        });

      },

      removeConfiguration: function(configuration, response) {
        var deleteConfiguration = new Api.Configurations();
        angular.copy(configuration, deleteConfiguration);

        deleteConfiguration.$delete({id: configuration.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      },

      getBooleanValue: function(name) {

        var configs = USERCONFIG.configurations;

        for (var i = 0; i < configs.length; i++) {
          if (configs[i].name === name) {
            var value = configs[i].value;
            return angular.isString(value) &&
              angular.lowercase(value) === 'true';
          }
        }

        return false;
      },

      getIntValue: function(name) {

        var configs = USERCONFIG.configurations;

        for (var i = 0; i < configs.length; i++) {
          if (configs[i].name === name) {
            var value = configs[i].value;
            return parseInt(value, 10);
          }
        }

        return 0;
      },

      getStringValue: function(name) {

        var configs = USERCONFIG.configurations;

        if (!configs) {
          return null;
        }

        for (var i = 0; i < configs.length; i++) {
          if (configs[i].name === name) {
            return configs[i].value;
          }
        }

        return null;
      }

    };
  });
