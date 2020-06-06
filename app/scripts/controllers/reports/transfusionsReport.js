'use strict';

angular.module('bsis').controller('TransfusionsReportCtrl', function($scope, $log, $filter, ReportsService, ReportsLayoutService, ReportGeneratorService, DATEFORMAT, gettextCatalog) {

  // Initialize variables
  var transfusionReactionTypes = [];
  var columnDefs = [];
  var master = {
    startDate: moment().subtract(7, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };
  $scope.search = angular.copy(master);
  $scope.dateFormat = DATEFORMAT;
  $scope.allSites = true;

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 8,
    paginationTemplate: 'views/template/pagination.html',
    columnDefs: columnDefs,
    minRowsToShow: 8,

    exporterPdfOrientation: 'landscape',
    exporterPdfPageSize: 'A4',
    exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
    exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
    exporterPdfMaxGridWidth: 600,

    // PDF header
    exporterPdfHeader: function() {
      var sitesNumberLine = gettextCatalog.getString('Usage Sites: {{count}}', {count: $scope.usageSitesNumber});
      return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
        gettextCatalog.getString('Transfusions Summary Report'),
        gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}),
        sitesNumberLine);
    },

    // Change formatting of PDF
    exporterPdfCustomFormatter: function(docDefinition) {
      docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('All Sites'), 0, docDefinition);
      docDefinition = ReportsLayoutService.paginatePdf(27, docDefinition);
      return docDefinition;
    },

    // PDF footer
    exporterPdfFooter: function(currentPage, pageCount) {
      return ReportsLayoutService.generatePdfPageFooter(
        gettextCatalog.getString('sites'), $scope.usageSitesNumber,
        currentPage, pageCount,
        $scope.gridOptions.exporterPdfOrientation);
    },

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  $scope.export = function(format) {
    if (format === 'pdf') {
      $scope.gridApi.exporter.pdfExport('all', 'all');
    } else if (format === 'csv') {
      $scope.gridApi.exporter.csvExport('all', 'all');
    }
  };

  // Report methods

  $scope.clearSearch = function(form) {
    $scope.search = angular.copy(master);
    form.$setPristine();
    form.$setUntouched();
    $scope.gridOptions.data = [];
    $scope.submitted = false;
    $scope.allSites = true;
  };

  $scope.clearUsageSite = function() {
    $scope.search.transfusionSiteId = null;
  };

  $scope.updateAllSites = function() {
    if ($scope.search.transfusionSiteId) {
      $scope.allSites = false;
    }
  };

  function populateColumnNames() {

    var columnChars = transfusionReactionTypes.length > 12 ? 6 : transfusionReactionTypes.length > 8 ? 8 : 12;

    columnDefs.push({
      displayName: gettextCatalog.getString('Usage Site'),
      field: 'usageSite',
      width: '**',
      minWidth: 150,
      maxWidth: 250 });

    var totalTransfusedUneventfully = ReportsLayoutService.hyphenateLongWords(gettextCatalog.getString('Total Transfused Uneventfully'), columnChars);
    columnDefs.push({
      displayName: totalTransfusedUneventfully,
      field: 'totalTransfusedUneventfully'});

    var totalNotTransfused = ReportsLayoutService.hyphenateLongWords(gettextCatalog.getString('Total Not Transfused'), columnChars);
    columnDefs.push({
      displayName: totalNotTransfused,
      field: 'totalNotTransfused'});

    angular.forEach(transfusionReactionTypes, function(transfusionReactionType) {
      var reactionType = ReportsLayoutService.hyphenateLongWords(transfusionReactionType.name, columnChars);
      columnDefs.push({
        displayName: reactionType,
        field: transfusionReactionType.name});
    });

    var totalReactions = ReportsLayoutService.hyphenateLongWords(gettextCatalog.getString('Total Reactions'), columnChars);
    columnDefs.push({
      displayName: totalReactions,
      field: 'totalReactions'});

    var totalUnknown = ReportsLayoutService.hyphenateLongWords(gettextCatalog.getString('Total Unknown'), columnChars);
    columnDefs.push({
      displayName: totalUnknown,
      field: 'totalUnknown'});
  }

  function initRow(reactionTypes) {
    var row = {};
    row.usageSite = '';
    row.totalTransfusedUneventfully = 0;
    row.totalNotTransfused = 0;
    angular.forEach(reactionTypes, function(reactionType) {
      row[reactionType.name] = 0;
    });
    row.totalReactions = 0;
    row.totalUnknown = 0;
    return row;
  }

  function populateRow(row, dataValue) {
    row.usageSite = dataValue.location.name;
    var outcome = ReportGeneratorService.getCohort(dataValue, 'Transfusion Outcome').option;
    if (outcome === 'TRANSFUSED_UNEVENTFULLY') {
      row.totalTransfusedUneventfully += dataValue.value;
    } else if (outcome === 'NOT_TRANSFUSED') {
      row.totalNotTransfused += dataValue.value;
    } else if (outcome === 'UNKNOWN') {
      row.totalUnknown += dataValue.value;
    } else if (outcome === 'TRANSFUSION_REACTION_OCCURRED') {
      var reactionType = ReportGeneratorService.getCohort(dataValue, 'Transfusion Reaction Type').option;
      row[reactionType] += dataValue.value;
      row.totalReactions += dataValue.value;
    }
  }

  $scope.getReport = function(searchForm) {

    if (!searchForm.$valid) {
      return;
    }

    $scope.searching = true;
    ReportsService.generateTransfusionsReport($scope.search, function(report) {
      $scope.searching = false;
      if (report.dataValues.length > 0) {
        var data = ReportGeneratorService.generateDataRowsGroupingByLocation(report.dataValues, transfusionReactionTypes, initRow, populateRow);
        $scope.gridOptions.data = data[0];
        $scope.usageSitesNumber = data[1];

        // Add summary row
        if ($scope.usageSitesNumber > 1) {
          var summaryRow = ReportGeneratorService.generateSummaryRow(report.dataValues, transfusionReactionTypes, initRow, populateRow);
          summaryRow.usageSite = gettextCatalog.getString('All Sites');
          $scope.gridOptions.data.push(summaryRow);
        }
        $scope.gridOptions.paginationCurrentPage = 1;
      } else {
        $scope.gridOptions.data = [];
        $scope.usageSitesNumber = 0;
      }
      $scope.submitted = true;
    }, function(err) {
      $scope.searching = false;
      $log.log(err);
    });
  };

  function init() {
    ReportsService.getTransfusionsReportForm(function(response) {
      $scope.usageSites = response.usageSites;
      transfusionReactionTypes = response.transfusionReactionTypes;
      populateColumnNames();
      $scope.usageSitesNumber = 0;
    }, $log.error);
  }

  init();
});
