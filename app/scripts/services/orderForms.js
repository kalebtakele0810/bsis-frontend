'use strict';

angular.module('bsis').factory('OrderFormsService', function(Api) {

  return {
    getOrderFormsForm: Api.OrderForms.getForm,
    addOrderForm: Api.OrderForms.save,
    getOrderForm: Api.OrderForms.get,
    updateOrderForm: Api.OrderForms.update,
    deleteOrderForm: Api.OrderForms.delete,
    getOrderFormItemForm: Api.OrderForms.getItemsForm,
    findOrderForms: Api.OrderForms.search
  };
});
