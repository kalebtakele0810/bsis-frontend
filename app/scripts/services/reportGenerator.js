'use strict';

angular.module('bsis').factory('ReportGeneratorService', function($filter) {

  function getCohort(dataValue, category) {
    return $filter('filter')(dataValue.cohorts, { category: category})[0];
  }

  function getWho(data) {
    return $filter('filter') (data.who);
  }

  // converts row objects to arrays
  //
  // This is used when using a list of row objects in the pdf.
  // Ui grid does this conversion automatically when generating the pdf,
  // but to calculate a summary and show it in the pdf without showing it in the grid,
  // we need to do the conversion manually.
  //
  // Example:
  // rowObject = row.location, row.componentType, row.gap
  // rowArray = [location, componentType, gap]
  function convertSummaryRowObjectsToArrays(rowObjects) {
    var rowArrays = [];
    angular.forEach(rowObjects, function(rowObject) {
      var rowArray = [];
      angular.forEach(rowObject, function(column, key) {
        rowArray.push('' + rowObject[key]);
      });
      rowArrays.push(rowArray);
    });
    return rowArrays;
  }

  return {

    // returns the data value's cohort
    getCohort: function(dataValue, category) {
      return getCohort(dataValue, category);
    },
    getWho : function (data) {
      return this.getWho(data);
    },

    // generate the rows of the report/table grouping them by location
    // param: dataValues: an array of the data values provided by the report
    // param: dynamicData: an array of dynamic data, which can be configured by the user and is used to init and populate data rows (can be null)
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // returns: A response object with the first element containing the generated rows, and the second element, the number of locations counted
    generateDataRowsGroupingByLocation: function(dataValues, dynamicData, initRow, populateRow) {
      var locationsNumber = 0;
      var rowsByLocation = {};

      angular.forEach(dataValues, function(dataValue) {
        var locationRow = rowsByLocation[dataValue.location.name];
        if (!locationRow) { // new location
          locationsNumber += 1;
          locationRow = initRow(dynamicData);
          rowsByLocation[dataValue.location.name] = locationRow;
        }
        populateRow(locationRow, dataValue);
      });

      var generatedRows = [];
      angular.forEach(rowsByLocation, function(row) {
        generatedRows.push(row);
      });

      var response = [];
      response.push(generatedRows);
      response.push(locationsNumber);
      return response;
    },

        // generate the rows of the report/table grouping them by location
    // param: dataValues: an array of the data values provided by the report
    // param: dynamicData: an array of dynamic data, which can be configured by the user and is used to init and populate data rows (can be null)
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // returns: A response object with the first element containing the generated rows, and the second element, the number of locations counted
    generateDataRowsGroupingByDonor: function(dataValues, dynamicData, initRow, populateRow) {
      var donorsNumber = 0;
      var rowsByDonor = {};

      angular.forEach(dataValues, function(dataValue) {
        var donorRow = rowsByDonor[dataValue.donor.name];
        if (!donorRow) { // new location
          donorsNumber += 1;
          donorRow = initRow(dynamicData);
          rowsByDonor[dataValue.donor.name] = donorRow;
        }
        populateRow(donorRow, dataValue);
      });

      var generatedRows = [];
      angular.forEach(rowsByDonor, function(row) {
        generatedRows.push(row);
      });

      var response = [];
      response.push(generatedRows);
      response.push(donorsNumber);
      return response;
    },

    // generate the rows of the report/table grouping them by location and a cohort
    // param: dataValues: an array of the data values provided by the report
    // param: cohortCategory: the category of the cohort we are grouping by
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // param: addSubtotalsRow1: a function that, if present, calculates the first subtotal row per location, else, no row is added
    // param: addSubtotalsRow2: a function that, if present, calculates the second subtotal row per location, else, no row is added
    // returns: A response object with the first element containing the generated rows, and the second element, the number of locations counted
    generateDataRowsGroupingByLocationAndCohort: function(dataValues, cohortCategory, initRow, populateRow, addSubtotalsRow1, addSubtotalsRow2) {
      var locationsNumber = 0;
      var rowsByLocation = {};

      angular.forEach(dataValues, function(dataValue) {
        var cohort = getCohort(dataValue, cohortCategory);
        if (cohort) {
          var cohortValue = cohort.option;
          var newLocation = false;

          // Check if there's rows for that location
          var rowsByCohort = rowsByLocation[dataValue.location.name];
          if (!rowsByCohort) { // new location
            locationsNumber += 1;
            rowsByCohort = {};
            rowsByLocation[dataValue.location.name] = rowsByCohort;
            newLocation = true;
          }

          // Check if there's a row for that location and cohort
          var cohortRow = rowsByCohort[cohortValue];
          if (!cohortRow) { // new cohortRow
            cohortRow = initRow(dataValue, newLocation);
            rowsByCohort[cohortValue] = cohortRow;
          }
          populateRow(cohortRow, dataValue);
        }
      });

      var generatedRows = [];
      angular.forEach(rowsByLocation, function(rows) {
        angular.forEach(rows, function(row) {
          generatedRows.push(row);
        });

        if (addSubtotalsRow1) {
          generatedRows.push(addSubtotalsRow1(rows));
        }

        if (addSubtotalsRow2) {
          generatedRows.push(addSubtotalsRow2(rows));
        }
      });

      var response = [];
      response.push(generatedRows);
      response.push(locationsNumber);
      return response;
    },

        // generate the rows of the report/table grouping them by location and a cohort
    // param: dataValues: an array of the data values provided by the report
    // param: cohortCategory: the category of the cohort we are grouping by
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // param: addSubtotalsRow1: a function that, if present, calculates the first subtotal row per location, else, no row is added
    // param: addSubtotalsRow2: a function that, if present, calculates the second subtotal row per location, else, no row is added
    // returns: A response object with the first element containing the generated rows, and the second element, the number of locations counted
    generateDataRowsGroupingByDonorAndCohort: function(myValues, cohortCategory, initRow, populateRow) {
      var donorNumber = 0;
      var rowsByDonor = {};

      angular.forEach(myValues, function(data) {
        var cohort = getWho(data, cohortCategory);
        if (cohort) {
          var cohortValue = cohort.option;
          var newDonor = false;

          // Check if there's rows for that location
          var rowsByCohort = rowsByDonor[data.donor.name];
          if (!rowsByCohort) { // new location
            donorNumber += 1;
            rowsByCohort = {};
            rowsByDonor[data.donor.name] = rowsByCohort;
            newDonor = true;
          }

          // Check if there's a row for that location and cohort
          var cohortRow = rowsByCohort[cohortValue];
          if (!cohortRow) { // new cohortRow
            cohortRow = initRow(data, newDonor);
            rowsByCohort[cohortValue] = cohortRow;
          }
          populateRow(cohortRow, data);
        }
      });

      var generatedRows = [];
      angular.forEach(rowsByDonor, function(rows) {
        angular.forEach(rows, function(row) {
          generatedRows.push(row);
        });
      });

      var response = {};
      response.push(generatedRows);
      response.push(donorNumber);
      return response;
    },
    generateWhoReportByDate: function(dataValues, initRow, populateRow) {      
      var generatedRows = [];
      angular.forEach(dataValues, function(data) {
        var whoRow = initRow();           
        var popp=populateRow(whoRow, data);
        generatedRows.push(popp);
      });
      var response = [];
      response.push(generatedRows);      
      return response;
    },

    generateDonationSummaryReportByDate: function(dataValues, initRow, populateRow) {      
      var generatedRows = [];
      angular.forEach(dataValues, function(data) {
        var whoRow = initRow();           
        var popp=populateRow(whoRow, data);
        generatedRows.push(popp);
      });
      var response = [];
      response.push(generatedRows);      
      return response;
    },

    // generate the summary rows grouping by cohort
    // param: dataValues: an array of the data values provided by the report
    // param: cohortCategory: the cohortCategory to group the rows by
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // param: addTotalsRow1: a function that, if present, calculates the first totals row, else, no row is added
    // param: addTotalsRow2: a function that, if present, calculates the second totals row, else, no row is added
    // returns: the generated rows, grouped by cohort, according to the cohort category entered
    generateSummaryRowsGroupingByCohort: function(dataValues, cohortCategory, initRow, populateRow, addTotalsRow1, addTotalsRow2) {
      var rowsByCohort = {};

      angular.forEach(dataValues, function(dataValue) {
        var cohort = getCohort(dataValue, cohortCategory);
        if (cohort) {
          var cohortValue = cohort.option;
          var cohortRow = rowsByCohort[cohortValue];
          if (!cohortRow) { // new cohortRow
            cohortRow = initRow();
            rowsByCohort[cohortValue] = cohortRow;
          }
          populateRow(cohortRow, dataValue);
        }
      });

      var generatedRows = [];
      angular.forEach(rowsByCohort, function(row) {
        generatedRows.push(row);
      });

      if (addTotalsRow1) {
        generatedRows.push(addTotalsRow1(generatedRows));
      }

      if (addTotalsRow2) {
        generatedRows.push(addTotalsRow2(generatedRows));
      }

      return convertSummaryRowObjectsToArrays(generatedRows);
    },

    // generate a summary row for the report/table
    // param: dataValues: an array of the data values provided by the report
    // param: dynamicData: an array of dynamic data, which can be configured by the user and is used to init and populate data rows (can be null)
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // returns: a summary row object that can be appended to the report/table
    generateSummaryRow: function(dataValues, dynamicData, initRow, populateRow) {
      var summaryRow = initRow(dynamicData);
      angular.forEach(dataValues, function(dataValue) {
        populateRow(summaryRow, dataValue);
      });
      return summaryRow;
    },


    // generate a summary row for the report/table
    // param: dataValues: an array of the data values provided by the report
    // param: dynamicData: an array of dynamic data, which can be configured by the user and is used to init and populate data rows (can be null)
    // param: initRow: a function that initialises and returns a single table row object
    // param: populateRow: a function that, given row and data value objects, updates the row with the counts from the data value
    // returns: a summary row object that can be appended to the report/table
    generateWhoRow: function(myValues, dynamicData, initRow, populateRow) {
      var whoRow = initRow(dynamicData);
      angular.forEach(myValues, function(dataValue) {
        populateRow(whoRow, dataValue);
      });
      return whoRow;
    }
  };

});
