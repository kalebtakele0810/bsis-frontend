'use strict';

angular.module('bsis')
	.factory('ComponentValidationService', function(ModalsService, $q, gettextCatalog) {
  return {
    showChildComponentWeightConfirmation: function(parent, totalChildrenWeight) {
      // Show confirmation if total child weight is greater than parent weight
      if (totalChildrenWeight > parent.weight) {
        return ModalsService.showConfirmation({
          title: gettextCatalog.getString('Overweight Child Packs'),
          button: gettextCatalog.getString('Continue'),
          message: gettextCatalog.getString('Combined weight of components exceeds weight of parent component. Do you want to continue?')
        });
      }

      // Continue with recording weight
      return $q.resolve();
    }
  };
});
