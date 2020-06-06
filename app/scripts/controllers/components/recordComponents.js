'use strict';

angular.module('bsis')
  .controller('RecordComponentsCtrl', function($scope, $location, $log, $timeout, $q, $routeParams, gettextCatalog, ComponentService, ComponentValidationService, ModalsService, UtilsService, $uibModal, DATEFORMAT) {

    $scope.component = null;
    $scope.componentsSearch = {
      donationIdentificationNumber: $routeParams.donationIdentificationNumber || ''
    };
    $scope.savingChildWeight = false;
    $scope.preProcessing = false;
    $scope.unprocessing = false;
    $scope.dateFormat = DATEFORMAT;
    $scope.maxProcessedOnDate = moment().endOf('day').toDate();
    $scope.processedOn = null;
    $scope.IsVisible = false;
    var producedComponentTypesByCombinationId = null;

    var originalComponent = null;
    var forms = $scope.forms = {};
    var componentList = null;

    

    $scope.ShowHide = function(){
        $scope.IsVisible = true;
    };

    $scope.clear = function() {
      $scope.componentsSearch.donationIdentificationNumber = '';
      $location.search({});
      $scope.gridOptions.data = null;
      angular.forEach(forms, function(form) {
        if (form) {
          form.$setPristine();
        }
      });
    };

    $scope.clearRecordComponentForm = function() {
      if ($scope.component) {
        $scope.component.componentTypeCombination = null;
        $scope.processedOn = {
          date: moment().toDate(),
          time: moment().toDate()
        };
      }
      if (forms.recordComponentsForm) {
        forms.recordComponentsForm.$setPristine();
        forms.recordComponentsForm.processedOnDate.$setValidity('dateInFuture', true);
      }
    };

    $scope.clearPreProcessForm = function() {
      if ($scope.component) {
        $scope.component = angular.copy(originalComponent);
      }
      if (forms.preProcessForm) {
        forms.preProcessForm.$setPristine();
      }
    };

    $scope.clearChildComponentWeightForm = function() {
      if ($scope.component) {
        $scope.component = angular.copy(originalComponent);
      }
      if (forms.childComponentWeightForm) {
        forms.childComponentWeightForm.$setPristine();
      }
    };

    function getMaxTimesConfirmationMessage(parentComponent, processedOn) {
      var confirmationMessage = '';
      // Add to confirmation message if time since donation is greater or equals to maxTimeSinceDonation
      var componentTypesExceedingMaxTimeSinceDonation = '';
      var separator = '';
      var timeSinceDonation = moment.duration(moment(processedOn).diff(moment(parentComponent.donationDateTime))).asHours();
      angular.forEach(producedComponentTypesByCombinationId[parentComponent.componentTypeCombination.id], function(componentType) {
        if (componentType.maxTimeSinceDonation != null && timeSinceDonation >= componentType.maxTimeSinceDonation) {
          // Ignore duplicates
          if (componentTypesExceedingMaxTimeSinceDonation.indexOf(componentType.componentTypeName) === -1) {
            componentTypesExceedingMaxTimeSinceDonation += separator + componentType.componentTypeName;
          }
          separator = ', ';
        }
      });

      if (componentTypesExceedingMaxTimeSinceDonation.length > 0) {
        confirmationMessage = gettextCatalog.getString('Time since donation exceeded, the following components will be flagged as unsafe: {{components}}.', {components: componentTypesExceedingMaxTimeSinceDonation});
      }

      // Add to confirmation message if bleed times gap is greater or equals to maxBleedTime
      var componentTypesExceedingMaxBleedTime = '';
      separator = '';
      var bleedTimesGap = moment.duration(moment(parentComponent.bleedEndTime).diff(moment(parentComponent.bleedStartTime))).asMinutes();
      angular.forEach(producedComponentTypesByCombinationId[parentComponent.componentTypeCombination.id], function(componentType) {
        if (componentType.maxBleedTime != null && bleedTimesGap >= componentType.maxBleedTime) {
          // Ignore duplicates
          if (componentTypesExceedingMaxBleedTime.indexOf(componentType.componentTypeName) === -1) {
            componentTypesExceedingMaxBleedTime += separator + componentType.componentTypeName;
          }
          separator = ', ';
        }
      });

      if (componentTypesExceedingMaxBleedTime.length > 0) {
        // Add two new lines if the maxTimeSinceDonation was also exceeded
        var conditionalNewLines = '';
        if (confirmationMessage.length > 0) {
          conditionalNewLines = '</br></br>';
        }
        confirmationMessage += conditionalNewLines + gettextCatalog.getString('Bleed time exceeded, the following components will be flagged as unsafe: {{components}}.', {components: componentTypesExceedingMaxBleedTime});
      }

      return confirmationMessage;
    }

    function showComponentMaxTimesConfirmation(parentComponent, processedOn) {

      var confirmationMessage = getMaxTimesConfirmationMessage(parentComponent, processedOn);

      if (confirmationMessage.length > 0) {
        return ModalsService.showConfirmation({
          title: gettextCatalog.getString('Time since Donation or Bleed Time exceeded'),
          button: gettextCatalog.getString('Continue'),
          message: confirmationMessage
        });
      }

      // Continue with processing
      return $q.resolve();
    }

    var recordComponents = function() {

      if (!forms.recordComponentsForm.$valid) {
        return;
      }

      var componentToRecord = {
        parentComponentId: $scope.component.id,
        componentTypeCombination: $scope.component.componentTypeCombination,
        processedOn: moment($scope.processedOn.date).hour($scope.processedOn.time.getHours()).minutes($scope.processedOn.time.getMinutes())
      };

      $scope.recordingComponents = true;
      showComponentMaxTimesConfirmation($scope.component, componentToRecord.processedOn).then(function() {
        ComponentService.recordComponents(componentToRecord, function(recordResponse) {
          if (recordResponse !== false) {
            $scope.gridOptions.data = recordResponse.components;
            forms.recordComponentsForm.$setPristine();
            $scope.component = null;
            $scope.recordingComponents = false;
          } else {
            // TODO: handle case where response == false
            $scope.recordingComponents = false;
          }
        });
      }).catch(function() {
        // Confirmation was rejected
        $scope.recordingComponents = false;
      });
    };

    $scope.updateTimeOnProcessedOnDate = function() {
      if (angular.isDefined($scope.processedOn.time)) {
        $scope.processedOn.date = moment($scope.processedOn.date).hour($scope.processedOn.time.getHours()).minutes($scope.processedOn.time.getMinutes()).toDate();
      }
    };

    function showComponentWeightConfirmation(component) {

      // Show confirmation if it is above max weight
      if (component.packType.maxWeight != null && component.weight > component.packType.maxWeight) {
        return ModalsService.showConfirmation({
          title: gettextCatalog.getString('Overweight Pack'),
          button: gettextCatalog.getString('Continue'),
          message: gettextCatalog.getString('The pack weight ({{componentWeight}}g) is above the maximum acceptable range ({{packTypeWeight}}g). Components from this donation will be flagged as unsafe. Do you want to continue?', {componentWeight: component.weight, packTypeWeight: component.packType.maxWeight})
        });
      }

      // Show confirmation if it is below low volume weight
      if (component.packType.lowVolumeWeight != null && component.weight <= component.packType.lowVolumeWeight) {
        return ModalsService.showConfirmation({
          title: gettextCatalog.getString('Underweight Pack'),
          button: gettextCatalog.getString('Continue'),
          message: gettextCatalog.getString('The pack weight ({{componentWeight}}g) is below the minimum acceptable range ({{packTypeWeight}}g). Components from this donation will be flagged as unsafe. Do you want to continue?', {componentWeight: component.weight, packTypeWeight: component.packType.lowVolumeWeight})
        });
      }

      if (component.packType.minWeight != null && component.weight < component.packType.minWeight) {
        // Show confirmation if it is below min weight when lowVolumeWeight is null
        if (component.packType.lowVolumeWeight == null) {
          return ModalsService.showConfirmation({
            title: gettextCatalog.getString('Underweight Pack'),
            button: gettextCatalog.getString('Continue'),
            message: gettextCatalog.getString('The pack weight ({{componentWeight}}g) is below the minimum acceptable range ({{packTypeWeight}}g). Components from this donation will be flagged as unsafe. Do you want to continue?', {componentWeight: component.weight, packTypeWeight: component.packType.minWeight})
          });
        } else {
          return ModalsService.showConfirmation({
            title: gettextCatalog.getString('Low Pack Weight'),
            button: gettextCatalog.getString('Continue'),
            message: gettextCatalog.getString('The pack weight ({{componentWeight}}g) is low (below {{packTypeWeight}}g). All components from this donation containing plasma will be flagged as Unsafe. Do you want to continue?', {componentWeight: component.weight, packTypeWeight: component.packType.minWeight})
          });
        }
      }

      // Weight is within valid range

      // Show confirmation if previous weight was not within valid range
      if (component.packType.maxWeight != null && component.packType.minWeight != null) {
        var previousComponent = $scope.gridApi.selection.getSelectedRows()[0];
        if (previousComponent.weight != null && (previousComponent.weight > component.packType.maxWeight
              || previousComponent.weight < component.packType.minWeight)) {
          return ModalsService.showConfirmation({
            title: gettextCatalog.getString('Pack Weight Update'),
            button: gettextCatalog.getString('Continue'),
            message: gettextCatalog.getString('The pack weight has changed from an underweight or overweight value to one within the acceptable range. Components from this donation will no longer be flagged as unsafe as a result of the pack weight. Do you want to continue?')
          });
        }
      }

      // Continue with recording weight
      return $q.resolve();
    }

    $scope.preProcessSelectedComponent = function() {

      if (forms.preProcessForm.$invalid) {
        return;
      }

      $scope.preProcessing = true;
      showComponentWeightConfirmation($scope.component).then(function() {

        ComponentService.preProcess({}, $scope.component, function(res) {
          $scope.gridOptions.data = $scope.gridOptions.data.map(function(component) {
            // Replace the component in the grid with the updated component
            if (component.id === res.component.id) {
              return res.component;
            } else {
              return component;
            }
          });

          // Clear validation on the record components form
          if (forms.recordComponentsForm) {
            forms.recordComponentsForm.$setPristine();
          }

          // Make sure that the row remains selected
          $timeout(function() {
            $scope.gridApi.selection.selectRow(res.component);
            $scope.preProcessing = false;
          });
        }, function(err) {
          $log.error(err);
          $scope.preProcessing = false;
        });
      }).catch(function() {
        // Confirmation was rejected
        $scope.preProcessing = false;
      });
    };

    function calculateChildrenTotalWeight(currentChild) {
      var totalWeight = 0;
      for (var i = 0;i < componentList.length;i++) {
        // do not include current child as weight might have changed
        if (componentList[i].id !== currentChild.id
          && componentList[i].parentComponentId === currentChild.parentComponentId) {
          // ensure calculation is done on components with weight set
          if (componentList[i].weight !== null) {
            totalWeight += componentList[i].weight;
          }
        }
      }
      return currentChild.weight + totalWeight;
    }

    function getParentComponent(selectedComponent) {
      var parentComponent = null;
      angular.forEach($scope.gridOptions.data, function(component) {
        if (component.id === selectedComponent.parentComponentId) {
          parentComponent = component;
          return;
        }
      });
      return parentComponent;
    }

    $scope.recordChildWeight = function() {

      if (forms.childComponentWeightForm.$invalid) {
        return;
      }

      $scope.savingChildWeight = true;
      //Refresh componentsList so that calculateChildrenTotalWeight(..) uses the correct weights
      ComponentService.getComponentsByDIN($scope.componentsSearch.donationIdentificationNumber, function(componentsResponse) {
        if (componentsResponse !== false) {
          componentList = componentsResponse.components;
          var parentComponent = getParentComponent($scope.component);
          var totalChildrenWeight = calculateChildrenTotalWeight($scope.component);
          ComponentValidationService.showChildComponentWeightConfirmation(parentComponent, totalChildrenWeight).then(function() {
            var weightParams = {weight: $scope.component.weight, id: $scope.component.id};
            ComponentService.recordChildWeight({}, weightParams, function(res) {
              $scope.gridOptions.data = $scope.gridOptions.data.map(function(component) {
                // Replace the component in the grid with the updated component
                if (component.id === res.component.id) {
                  return res.component;
                } else {
                  return component;
                }
              });

              // Clear validation on the record components form
              if (forms.childComponentWeightForm) {
                forms.childComponentWeightForm.$setPristine();
              }

              // Make sure that the row remains selected
              $timeout(function() {
                $scope.gridApi.selection.selectRow(res.component);
                $scope.savingChildWeight = false;
              });
            }, function(err) {
              $log.error(err);
              $scope.savingChildWeight = false;
            });
          }).catch(function() {
            // Confirmation was rejected
            $scope.savingChildWeight = false;
          });
        }
      });
    };

    $scope.unprocessSelectedComponent = function() {
      var unprocessConfirmation = {
        title:  gettextCatalog.getString('Unprocess Component'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('Unprocessing this component will cause all components that were produced from it to be deleted. Do you want to continue?')
      };

      $scope.unprocessing = true;
      ModalsService.showConfirmation(unprocessConfirmation).then(function() {
        ComponentService.unprocess({}, $scope.component, function() {
          $scope.getComponentsByDIN();
          $scope.unprocessing = false;
        }, function(err) {
          $log.error(err);
          $scope.unprocessing = false;
        });
      }).catch(function() {
        // Confirmation was rejected
        $scope.unprocessing = false;
      });
    };

    $scope.getComponentsByDIN = function() {
      if (forms.findComponentsForm && forms.findComponentsForm.$invalid) {
        return;
      }
      $scope.componentsSearch.search = true;
      $location.search($scope.componentsSearch);
      $scope.searching = true;
      ComponentService.getComponentsByDIN($scope.componentsSearch.donationIdentificationNumber, function(componentsResponse) {
        if (componentsResponse !== false) {
          $scope.gridOptions.data = componentsResponse.components;
          componentList = componentsResponse.components;
          $scope.component = null;
          $scope.searching = false;
        } else {
          $scope.searching = false;
        }
      });
    };

    $scope.getParentComponentWeight = function(selectedComponent) {
      var parentComponent = getParentComponent(selectedComponent);
      if (parentComponent != null) {
        return parentComponent.weight;
      }
      return null;
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
        cellFilter: 'titleCase | translate',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Created On',
        displayName: gettextCatalog.getString('Created On'),
        field: 'createdOn',
        cellFilter: 'bsisDateTime',
        width: '**',
        maxWidth: '160'
      },
      {
        name: 'Expiry Status',
        displayName: gettextCatalog.getString('Expiry Status'),
        field: 'daysToExpire',
        cellFilter: 'daysToExpire',
        width: '**',
        maxWidth: '200',
        sortingAlgorithm: function(a, b, rowA, rowB) {
          return UtilsService.dateSort(rowA.entity.expiresOn, rowB.entity.expiresOn);
        }
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
      multiSelect: false,
      enableRowSelection: true,
      paginationTemplate: 'views/template/pagination.html',
      paginationPageSize: 5,
      minRowsToShow: 5,
      enableSelectAll: false,

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function() {
          var selectedRows = gridApi.selection.getSelectedRows();
          // Clear the component if no row is selected
          if (selectedRows.length === 0) {
            $scope.component = null;
          } else {
            $scope.component = angular.copy(selectedRows[0]);
            originalComponent = angular.copy(selectedRows[0]);
            $scope.processedOn = {
              date: moment().toDate(),
              time: moment().toDate()
            };
          }
        });
      }
    };

    $scope.confirmProcessLabledComponent = function() {
      if ($scope.component.inventoryStatus === 'IN_STOCK') {
        var messageText = '';
        messageText += gettextCatalog.getString('The selected component has already been labelled. Do you want to continue?');
        var saveObject = {
          title: gettextCatalog.getString('Process labelled component'),
          button: gettextCatalog.getString('Continue'),
          message: messageText
        };
        var modalInstance = $uibModal.open({
          animation: false,
          templateUrl: 'views/confirmModal.html',
          controller: 'ConfirmModalCtrl',
          resolve: {
            confirmObject: function() {
              return saveObject;
            }
          }
        });
        modalInstance.result.then(function() {
          // Then record components
          recordComponents();
        }, function() {
          // record cancelled - do nothing
        });
      } else {
        recordComponents();
      }
    };

    function init() {
      if ($routeParams.search) {
        $scope.getComponentsByDIN();
      }
      ComponentService.getComponentsFormFields(function(response) {
        if (response !== false) {
          producedComponentTypesByCombinationId = response.producedComponentTypesByCombinationId;
        }
      });
    }

    init();
  });
