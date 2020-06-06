'use strict';

angular.module('bsis').factory('InventoriesService', function(Api) {
  return {
    search: Api.Inventories.search,
    getSearchForm: Api.Inventories.getSearchForm,
    getInventoryComponentByCodeAndDIN: Api.Inventories.getInventory
  };
});
