'use strict';

/*global pdfMake */

angular.module('bsis').controller('ViewOrderCtrl', function($scope, $location, $log, $filter, $routeParams, OrderFormsService, ModalsService, DATEFORMAT, gettextCatalog) {

  $scope.dateFormat = DATEFORMAT;

  var unitsOrderedColumnDefs = [
    {
      displayName: gettextCatalog.getString('Component Type'),
      field: 'componentTypeName',
      width: '**'
    },
    {
      displayName: gettextCatalog.getString('Blood Group'),
      field: 'bloodGroup',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Units Ordered'),
      field: 'numberOfUnits',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Units Supplied'),
      field: 'numberSupplied',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Gap'),
      field: 'gap',
      width: '**',
      maxWidth: '200'
    }
  ];


  var unitsSuppliedColumnDefs = [
    {
      displayName: gettextCatalog.getString('DIN'),
      field: 'donationIdentificationNumber',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Component Type'),
      field: 'componentTypeName',
      width: '**'
    },
    {
      displayName: gettextCatalog.getString('Blood Group'),
      field: 'bloodGroup',
      width: '**',
      maxWidth: '200'
    }
  ];

  $scope.unitsOrderedGridOptions = {
    data: [],
    columnDefs: unitsOrderedColumnDefs,
    paginationPageSize: 4,
    paginationPageSizes: [4],
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 4
  };

  $scope.unitsSuppliedGridOptions = {
    data: [],
    columnDefs: unitsSuppliedColumnDefs,
    paginationPageSize: 4,
    paginationPageSizes: [4],
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 4
  };

  function populateUnitsOrderedGrid(orderForm) {
    $scope.unitsOrderedGridOptions.data = [];
    var componentsToMatch = angular.copy(orderForm.components);
    angular.forEach(orderForm.items, function(item) {
      var row = {
        componentTypeName: item.componentType.componentTypeName,
        bloodGroup: item.bloodGroup,
        numberOfUnits: item.numberOfUnits,
        numberSupplied: 0,
        gap: item.numberOfUnits
      };
      var unmatchedComponents = [];
      angular.forEach(componentsToMatch, function(component) {
        var bloodGroup = component.bloodGroup;
        if (row.gap > 0 && component.componentType.id === item.componentType.id && bloodGroup === item.bloodGroup) {
          // can't over supply and component matches
          row.numberSupplied = row.numberSupplied + 1;
          row.gap = row.gap - 1;
        } else {
          unmatchedComponents.push(component);
        }
      });
      componentsToMatch = unmatchedComponents; // ensure we don't match the component more than once
      $scope.unitsOrderedGridOptions.data.push(row);
    });
  }

  function populateUnitsSuppliedGrid(orderForm) {
    $scope.unitsSuppliedGridOptions.data = [];
    angular.forEach(orderForm.components, function(component) {
      var row = {
        donationIdentificationNumber: component.donationIdentificationNumber,
        componentTypeName: component.componentType.componentTypeName,
        bloodGroup: component.bloodGroup
      };
      $scope.unitsSuppliedGridOptions.data.push(row);
    });
  }

  function init() {
    // Fetch the order form by its id
    OrderFormsService.getOrderForm({ id: $routeParams.id }, function(res) {
      $scope.orderForm = res.orderForm;
      $scope.orderFormHasPatient = res.orderForm.patient !== null ? true : false;
      populateUnitsOrderedGrid($scope.orderForm);
      populateUnitsSuppliedGrid($scope.orderForm);
    }, $log.error);
  }

  var generateDispatchReportTitle = function() {
    var title = gettextCatalog.getString('Order Date') + ': ' + $filter('bsisDate')($scope.orderForm.orderDate) + '   ' +
      gettextCatalog.getString('Dispatch From') + ': ' + $scope.orderForm.dispatchedFrom.name + '   ' +
      gettextCatalog.getString('Dispatched To') + ': ' + $scope.orderForm.dispatchedTo.name + '   ' +
      gettextCatalog.getString('Order Type') + ': ' +  gettextCatalog.getString($filter('titleCase')($scope.orderForm.type)) + '  \n\n';

    if ($scope.orderForm.type === 'PATIENT_REQUEST') {
      var notSpecifiedText = gettextCatalog.getString('Not Specified');
      title += gettextCatalog.getString('Blood Bank') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.hospitalBloodBankNumber) ? notSpecifiedText : $scope.orderForm.patient.hospitalBloodBankNumber) + '   ';
      title += gettextCatalog.getString('Ward Number') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.hospitalWardNumber) ? notSpecifiedText : $scope.orderForm.patient.hospitalWardNumber) + '   ';
      title += gettextCatalog.getString('Patient Number') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.patientNumber) ? notSpecifiedText : $scope.orderForm.patient.patientNumber) + '   ';
      title += gettextCatalog.getString('Patient Name') + ': ' + ($scope.orderForm.patient.name1 + ' ' + $scope.orderForm.patient.name2) + '   ';
      title += gettextCatalog.getString('Blood Group') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.bloodGroup) ? notSpecifiedText : $scope.orderForm.patient.bloodGroup) + '   ';
      title += gettextCatalog.getString('Gender') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.gender) ? notSpecifiedText : gettextCatalog.getString($filter('titleCase')($scope.orderForm.patient.gender))) + '   ';
      title += gettextCatalog.getString('Date of Birth') + ': ' + ($scope.isFieldEmpty($scope.orderForm.patient.dateOfBirth) ? notSpecifiedText : $filter('bsisDate')($scope.orderForm.patient.dateOfBirth)) + ' \n\n';
    }

    return title;
  };

  var retrieveDispatchedDINs = function(componentTypeName, bloodGroup) {
    var dispatchedDINs = [];
    $scope.unitsSuppliedGridOptions.data.forEach(function(unitSuppliedRecord) {
      if (unitSuppliedRecord.componentTypeName === componentTypeName &&
        unitSuppliedRecord.bloodGroup === bloodGroup) {
        dispatchedDINs.push(unitSuppliedRecord.donationIdentificationNumber);
      }
    });
    return dispatchedDINs;
  };

  var generateDispatchReportRecords = function(unitOrderedRecord) {
    var dispatchedDINs = retrieveDispatchedDINs(unitOrderedRecord.componentTypeName, unitOrderedRecord.bloodGroup);
    var dispatchReportRecords = [];

    dispatchReportRecords.push([
      { rowSpan: dispatchedDINs.length, text: unitOrderedRecord.componentTypeName },
      { rowSpan: dispatchedDINs.length, text: unitOrderedRecord.bloodGroup },
      { rowSpan: dispatchedDINs.length, text: unitOrderedRecord.numberOfUnits, alignment: 'right' },
      { rowSpan: dispatchedDINs.length, text: unitOrderedRecord.numberSupplied, alignment: 'right' },
      { text: dispatchedDINs[0], alignment: 'center' },
      { rowSpan: dispatchedDINs.length, text: unitOrderedRecord.gap, alignment: 'right' }]);

    if (dispatchedDINs.length > 1) {
      dispatchedDINs.splice(0, 1); // removes the first DIN (already inserted)
      dispatchedDINs.forEach(function(din) {
        dispatchReportRecords.push(['', '', '', '', { text: din, alignment: 'center' }, '']);
      });
    }

    return dispatchReportRecords;
  };

  var generateDispatchNoteReport = function() {
    var body = [];

    // table header
    body.push([
      {style: 'tableHeader', text: gettextCatalog.getString('Component Type')},
      {style: 'tableHeader', text: gettextCatalog.getString('Blood Group')},
      {style: 'tableHeader', text: gettextCatalog.getString('Units Ordered')},
      {style: 'tableHeader', colSpan: 2, text: gettextCatalog.getString('Units Supplied') + ' / ' +  gettextCatalog.getString('DIN')},
      null,
      {style: 'tableHeader', text: gettextCatalog.getString('Gap')}]
    );

    // data rows
    $scope.unitsOrderedGridOptions.data.forEach(function(unitOrderedRecord) {
      var dispatchReportRecords = generateDispatchReportRecords(unitOrderedRecord);
      dispatchReportRecords.forEach(function(dispatchReportRecord) {
        body.push(dispatchReportRecord);
      });
    });

    var docDefinition = {
      content: [
        {
          text: gettextCatalog.getString('Dispatch Note'),
          style: 'header'
        },
        generateDispatchReportTitle(),
        {
          style: 'tableExample',
          table: {
            widths: ['*', 70, 80, 50, 70, 50],
            body: body
          }
        }
      ],
      styles: {
        header: {
          fontSize: 17,
          bold: true,
          alignment: 'center'
        },
        tableHeader: {
          alignment: 'center',
          bold: true
        }
      }
    };

    return docDefinition;
  };

  $scope.exportDispatchNote = function() {
    pdfMake.createPdf(generateDispatchNoteReport()).open();
  };

  $scope.deleteOrder = function() {
    var unprocessConfirmation = {
      title: gettextCatalog.getString('Void Order'),
      button: gettextCatalog.getString('Void'),
      message: gettextCatalog.getString('Are you sure that you want to delete this Order?')
    };

    ModalsService.showConfirmation(unprocessConfirmation).then(function() {
      $scope.deleting = true;
      OrderFormsService.deleteOrderForm({ id: $routeParams.id }, function() {
        $location.path('/manageOrders');
      }, function(err) {
        $log.error(err);
        $scope.deleting = false;
      });
    }).catch(function() {
      // Confirmation was rejected
      $scope.deleting = false;
    });
  };

  $scope.dispatch = function() {
    var dispatchConfirmation = {
      title: gettextCatalog.getString('Dispatch Order'),
      button: gettextCatalog.getString('Dispatch Order'),
      message: gettextCatalog.getString('Are you sure you want to dispatch the order?')
    };

    ModalsService.showConfirmation(dispatchConfirmation).then(function() {
      $scope.orderForm.status = 'DISPATCHED';
      OrderFormsService.updateOrderForm({}, $scope.orderForm, function(res) {
        $scope.orderForm = res.orderForm;
        populateUnitsOrderedGrid($scope.orderForm);
        populateUnitsSuppliedGrid($scope.orderForm);
      }, function(err) {
        $log.error(err);
      });
    });
  };

  $scope.isFieldEmpty = function(field) {
    if (field) {
      return field.length === 0;
    }
    return true;
  };

  $scope.edit = function() {
    $location.path('/fulfilOrder/' + $routeParams.id);
  };

  init();

});
