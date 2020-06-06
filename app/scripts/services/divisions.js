'use strict';

angular.module('bsis').factory('DivisionsService', function(Api) {
  return {
    getDivision: Api.Divisions.get,
    findDivisions: Api.Divisions.search,
    updateDivision: Api.Divisions.update,
    createDivision: Api.Divisions.save
  };
});
