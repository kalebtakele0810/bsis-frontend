'use strict';

angular.module('bsis').controller('ViewComponentBatchCtrl', function($scope, $routeParams, $filter, $log, gettextCatalog, ComponentBatchService) {

  $scope.donationBatchClosed = gettextCatalog.getString('Closed');
  $scope.donationBatchOpen = gettextCatalog.getString('Open');
  $scope.gridOptions = {
    columnDefs: [
      {
        displayName: gettextCatalog.getString('DIN'),
        name: 'donationIdentificationNumber'
      }, {
        displayName: gettextCatalog.getString('Pack Type'),
        name: 'packType.packType'
      }
    ],

    exporterPdfOrientation: 'portrait',
    exporterPdfPageSize: 'A4',
    exporterPdfDefaultStyle: {fontSize: 4, margin: [-2, 0, 0, 0] },
    exporterPdfTableHeaderStyle: {fontSize: 5, bold: true, margin: [-2, 0, 0, 0] },
    exporterPdfMaxGridWidth: 400,

    // PDF header
    exporterPdfHeader: function() {
      var finalArray = [
        {
          text: gettextCatalog.getString('Delivery Note'),
          fontSize: 10,
          bold: true,
          margin: [30, 20, 0, 0] // [left, top, right, bottom]
        }
      ];
      return finalArray;
    },

    exporterPdfTableStyle: {margin: [-10, 10, 0, 0]},

    exporterPdfCustomFormatter: function(docDefinition) {
      var prefix = [];
      prefix.push(
        {
          text: gettextCatalog.getString('Date Created') + ': ',
          bold: true
        }, {
          text: $filter('bsisDate')($scope.componentBatch.donationBatch.donationBatchDate)
        }, {
          text: ' ' + gettextCatalog.getString('Venue') + ': ',
          bold: true
        }, {
          text: $scope.componentBatch.donationBatch.venue.name
        }, {
          text: ' ' + gettextCatalog.getString('Number of Donations') + ': ',
          bold: true
        }, {
          text: '' + $scope.componentBatch.donationBatch.numDonations
        }, {
          text: ' ' + gettextCatalog.getString('Status') + ': ',
          bold: true
        }, {
          text: ($scope.componentBatch.donationBatch.isClosed ? $scope.donationBatchClosed : $scope.donationBatchOpen) + '\n'
        }
      );
      prefix.push(
        {
          text: ' ' + gettextCatalog.getString('Time of Delivery') + ': ',
          bold: true
        }, {
          text: $filter('bsisDateTime')($scope.componentBatch.deliveryDate)
        }, {
          text: ' ' + gettextCatalog.getString('Location') + ': ',
          bold: true
        }, {
          text: $scope.componentBatch.location.name
        }, {
          text: ' ' + gettextCatalog.getString('Number of Blood Transport Boxes') + ': ',
          bold: true
        }, {
          text: '' + $scope.componentBatch.bloodTransportBoxes.length + '\n'
        }
      );
      angular.forEach($scope.componentBatch.bloodTransportBoxes, function(box) {
        prefix.push(
          {
            text: gettextCatalog.getString('Blood Transport Box Temperature') + ': ',
            bold: true
          }, {
            text: box.temperature + '\u00B0C\n'
          }
        );
      });

      docDefinition.content = [{text: prefix, margin: [-10, 0, 0, 0], fontSize: 7}].concat(docDefinition.content);
      return docDefinition;
    },

    // PDF footer
    exporterPdfFooter: function(currentPage, pageCount) {
      var columns = [
        {text: gettextCatalog.getString('Number of components: {{componentNumber}}', {componentNumber: $scope.gridOptions.data.length}), width: 'auto'},
        {text: gettextCatalog.getString('Date generated: {{date}}', { date:  $filter('bsisDateTime')(new Date())}), width: 'auto'},
        {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
      ];
      return {
        columns: columns,
        columnGap: 10,
        margin: [30, 0],
        fontSize: 6
      };
    },

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }

  };

  $scope.componentBatch = null;
  $scope.components = [];

  $scope.printDeliveryNote = function() {
    $scope.gridApi.exporter.pdfExport('all', 'all');
  };

  function fetchComponentBatchById(componentBatchId) {
    ComponentBatchService.getComponentBatch(componentBatchId, function(response) {
      $scope.componentBatch = response;
      angular.forEach($scope.componentBatch.components, function(component) {
        if (component.isInitialComponent) {
          $scope.components.push(component);
        }
      });
      $scope.gridOptions.data = $scope.components;
    }, function(err) {
      $log.error(err);
    });
  }

  fetchComponentBatchById($routeParams.id);
});
