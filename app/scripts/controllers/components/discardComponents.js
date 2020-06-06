angular.module('bsis')
  .controller('DiscardComponentsCtrl', function($scope, $location, ComponentService, ICONS, $filter, ngTableParams, $timeout, $routeParams, uiGridConstants, gettextCatalog, $log, ModalsService) {

    var selectedComponents = [];
    var forms = $scope.forms = {};
    $scope.selectedAction = null;
    $scope.componentsReceived = true;
    $scope.componentsSearch = {
      donationIdentificationNumber: $routeParams.donationIdentificationNumber || ''
    };
    $scope.discardingComponent = false;
    $scope.undiscarding = false;
    $scope.discard = {};

    function clearSelectedAction() {
      if ($scope.gridApi) {
        $scope.gridApi.selection.clearSelectedRows();
        $scope.selectedAction = null;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
      }
    }

    $scope.clearFindComponentsForm = function() {
      $scope.componentsSearch.donationIdentificationNumber = '';
      selectedComponents = [];
      clearSelectedAction();
      $scope.gridOptions.data = null;
      $location.search({});
      forms.findComponentsForm.$setPristine();
      $scope.discard = {};
    };

    $scope.clearDiscardComponentsForm = function() {
      $location.search({});
      forms.discardComponentsForm.$setPristine();
      $scope.discard = {};
    };

    $scope.discardComponents = function() {

      if (forms.discardComponentsForm.$invalid) {
        return;
      }

      var discardConfirmation = {
        title: gettextCatalog.getString('Discard Components'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('Are you sure you want to discard these components?')
      };

      ModalsService.showConfirmation(discardConfirmation).then(function() {

        // Create a list of component ids to discard
        $scope.discard.componentIds = [];
        angular.forEach(selectedComponents, function(component) {
          $scope.discard.componentIds.push(component.id);
        });
        $scope.discardingComponent = true;

        // Discard components
        ComponentService.discard({}, $scope.discard, function() {
          clearSelectedAction();
          $scope.discardingComponent = false;
          $scope.discard = {};
          $scope.gridOptions.data = $scope.getComponentsByDIN();
        }, function(err) {
          $log.error(err);
          $scope.discardingComponent = false;
        });

      }).catch(function() {
        // Confirmation was rejected
        $scope.discardingComponent = false;
      });
    };

    $scope.undiscardComponents = function() {

      var undiscardConfirmation = {
        title: gettextCatalog.getString('Undiscard Components'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('Are you sure you want to undiscard these components?')
      };

      ModalsService.showConfirmation(undiscardConfirmation).then(function() {

        // Create a list of component ids to undiscard
        var undiscard = {};
        undiscard.componentIds = [];
        angular.forEach(selectedComponents, function(component) {
          undiscard.componentIds.push(component.id);
        });
        $scope.undiscarding = true;

        // Undiscard components
        ComponentService.undiscard({}, undiscard, function() {
          $scope.undiscarding = false;
          $scope.getComponentsByDIN();
        }, function(err) {
          $log.error(err);
          $scope.undiscarding = false;
        });

      }).catch(function() {
        // Confirmation was rejected
        $scope.undiscarding = false;
      });
    };

    $scope.getComponentsByDIN = function() {
      if (forms.findComponentsForm && forms.findComponentsForm.$invalid) {
        return;
      }
      clearSelectedAction();
      $scope.componentsSearch.search = true;
      $location.search($scope.componentsSearch);
      $scope.searching = true;
      ComponentService.getComponentsByDIN($scope.componentsSearch.donationIdentificationNumber, function(componentsResponse) {
        if (componentsResponse !== false) {
          $scope.gridOptions.data = componentsResponse.components;
          $scope.searching = false;
        } else {
          $scope.searching = false;
        }
      });
    };

    var columnDefs = [
      {
        name: 'Component Code',
        displayName: gettextCatalog.getString('Component Code'),
        field: 'componentCode',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Component Type',
        displayName: gettextCatalog.getString('Component Type'),
        field: 'componentType.componentTypeName',
        width: '**',
        minWidth: '250'
      },
      {
        name: 'Status',
        displayName: gettextCatalog.getString('Status'),
        field: 'status',
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '{{row.entity["status"] | titleCase | translate}}' +
          '</div>',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Created On',
        displayName: gettextCatalog.getString('Created On'),
        field: 'createdOn',
        cellFilter: 'bsisDate',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Expiry Status',
        displayName: gettextCatalog.getString('Expiry Status'),
        field: 'daysToExpire',
        cellFilter: 'daysToExpire',
        width: '**',
        maxWidth: '250'
      },
      {
        name: 'Weight',
        displayName: gettextCatalog.getString('Weight'),
        field: 'weight',
        width: '**',
        maxWidth: '120'
      }
    ];

    $scope.gridOptions = {
      data: null,
      columnDefs: columnDefs,
      multiSelect: true,
      enableRowSelection: true,
      paginationTemplate: 'views/template/pagination.html',
      paginationPageSize: 5,
      minRowsToShow: 5,

      isRowSelectable: function(row) {
        var selectable = true;
        if ($scope.selectedAction === 'DISCARD') {
          if (!row.entity.permissions.canDiscard) {
            selectable = false;
          }
        }

        if ($scope.selectedAction === 'UNDISCARD') {
          if (!row.entity.permissions.canUndiscard) {
            selectable = false;
          }
        }

        if ($scope.selectedAction === 'NONE') {
          if (row.entity.permissions.canDiscard || row.entity.permissions.canUndiscard) {
            selectable = false;
          }
        }

        return selectable;
      },

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function() {
          selectedComponents = gridApi.selection.getSelectedRows();
          // If no row is selected selectedAction = null
          if (selectedComponents.length === 0) {
            $scope.selectedAction = null;
            $scope.componentsReceived = true;
          } else if (selectedComponents.length === 1) {
            // When the first row is selected, assign value selectedAction
            var firstSelectedComponent = angular.copy(selectedComponents[0]);
            if (firstSelectedComponent.permissions.canDiscard) {
              $scope.selectedAction = 'DISCARD';
            } else if (firstSelectedComponent.permissions.canUndiscard) {
              $scope.selectedAction = 'UNDISCARD';
            } else {
              $scope.selectedAction = 'NONE';
            }
            if (!firstSelectedComponent.hasComponentBatch) {
              $scope.componentsReceived = false;
              $scope.selectedAction = 'NONE';
            }
          }

          // Notify the row selection so that isRowSelectable is called
          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT);
        });
      }
    };

    function init() {
      if ($routeParams.search) {
        $scope.getComponentsByDIN();
      }
      ComponentService.getComponentsFormFields(function(response) {
        if (response !== false) {
          $scope.discardReasons = response.discardReasons;
        }
      });
    }

    init();
  });
