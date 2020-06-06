'use strict';

angular.module('bsis').controller('DonationSummaryReportCtrl', function ($scope, $log, $filter, ReportsService, ReportsLayoutService, ReportGeneratorService, DATEFORMAT, gettextCatalog) {

    // Initialize variables
    // var whoReports = [];
    var columnDefs = [];
    var master = {
        startDate: moment().subtract(7, 'days').startOf('day').toDate(),
        endDate: moment().endOf('day').toDate()
    };
    $scope.dateFormat = DATEFORMAT;
    $scope.search = angular.copy(master);
    //var dataValues = null;
    var myValues = [{}];

    // Report methods

    function initRow() {
        var row = {};
        row.donationnumber = 0;
        row.firstname = '';
        row.middlename = '';
        row.lastname = '';
        row.totaldonationsnumber = 0;        
        return row;
    }

    function populateRow(row, dataValue) {       

        row.donationnumber = dataValue[0];
        row.firstname = dataValue[1];
        row.middlename = dataValue[2];
        row.lastname = dataValue[3];       
        row.totaldonationsnumber = dataValue[4] ;       
        return row;
    }

    $scope.clearSearch = function (form) {
        $scope.search = angular.copy(master);
        form.$setPristine();
        form.$setUntouched();
        $scope.gridOptions.data = [];
        $scope.submitted = false;
    };

    $scope.getReport = function (selectPeriodForm) {

        if (!selectPeriodForm.$valid) {
            return;
        }

        var period = {};
        if ($scope.search.startDate) {
            var startDate = moment($scope.search.startDate).startOf('day').toDate();
            period.startDate = startDate;
        }
        if ($scope.search.endDate) {
            var endDate = moment($scope.search.endDate).endOf('day').toDate();
            period.endDate = endDate;
        }

        $scope.searching = true;
        ReportsService.generateDonationSummaryReport(period, function (report) {
            $scope.searching = false;

            console.log("kjhkjbkhjb", report.donationreport);
            var rep = report.donationreport;            
            if (report.donationreport.length > 0) {


                var data = ReportGeneratorService.generateDonationSummaryReportByDate(rep, initRow, populateRow);
                $scope.gridOptions.data = data[0];
                // $scope.donorNumber = data[1];
                $scope.gridOptions.paginationCurrentPage = 1;
            } else {
                $scope.gridOptions.data = [];
                // $scope.donorNumber = 0;
                // myValues = null;
            }
            $scope.submitted = true;
        }, function (err) {
            $scope.searching = false;
            $log.error(err);
        });
    };
    // Grid ui variables and methods
    var columnDefs = [
        { displayName: gettextCatalog.getString('Donation Number'), field: 'donationnumber', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('First Name'), field: 'firstname', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Middle Name'), field: 'middlename', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Last Name'), field: 'lastname', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Total Donations Number'), field: 'totaldonationsnumber', width: '**', minWidth: 200 }
        
    ];


    $scope.gridOptions = {
        data: [],
        paginationPageSize: 12,
        paginationTemplate: 'views/template/pagination.html',
        columnDefs: columnDefs,
        minRowsToShow: 12,

        exporterPdfOrientation: 'landscape',
        exporterPdfPageSize: 'A4',
        exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
        exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
        exporterPdfMaxGridWidth: ReportsLayoutService.pdfLandscapeMaxGridWidth,

        // PDF header
        exporterPdfHeader: function () {
            return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
                'WHO GDBS Summary Report',
                ['Date Period: ', $filter('bsisDate')($scope.search.startDate), ' to ', $filter('bsisDate')($scope.search.endDate)]);
        },

        // Change formatting of PDF
        exporterPdfCustomFormatter: function (docDefinition) {
            if ($scope.venuesNumber > 1) {
                docDefinition = ReportsLayoutService.addSummaryContent($scope.gridOptions.summaryData, docDefinition);
            }
            docDefinition = ReportsLayoutService.highlightTotalRows('All', 1, docDefinition);
            docDefinition = ReportsLayoutService.paginatePdf(27, docDefinition);
            return docDefinition;
        },

        // PDF footer
        exporterPdfFooter: function (currentPage, pageCount) {
            return ReportsLayoutService.generatePdfPageFooter('venues', $scope.venuesNumber, currentPage, pageCount, $scope.gridOptions.exporterPdfOrientation);
        },

        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.export = function (format) {
        if (format === 'pdf') {
            $scope.gridApi.exporter.pdfExport('all', 'all');
        } else if (format === 'csv') {
            $scope.gridApi.exporter.csvExport('all', 'all');
        }
    };


    // init();

});
