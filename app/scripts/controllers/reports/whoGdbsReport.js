'use strict';

angular.module('bsis').controller('WhoGdbsReportCtrl', function ($scope, $log, $filter, ReportsService, ReportsLayoutService, ReportGeneratorService, DATEFORMAT, gettextCatalog) {

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
        row.totaldonors = 0;
        row.voluntarydonations = 0;
        row.permanentdeferral = 0;
        row.temporarydeferral = 0;
        row.lowweight = 0;
        row.lowhaemoglobin = 0;
        row.medicalcondition = 0;
        row.highriskbehaviour = 0;
        row.travelhistory = 0;
        row.testoutcomes = 0;
        row.otherreasons = 0;
        row.maledonations = 0;
        row.femaledonations = 0;
        row.under18donations = 0;
        row.under24donations = 0;
        row.under44donations = 0;
        row.under64donations = 0;
        row.over64donations = 0;
        return row;
    }

    function populateRow(row, dataValue) {
        // var totaldonors = ReportGeneratorService.getCohort(dataValue, 'Total number of voluntary non-remunerated donors').option;
        // var voluntarydonations = ReportGeneratorService.getCohort(dataValue, 'Voluntary non-remunerated donations').option;
        // var permanentdeferral = ReportGeneratorService.getCohort(dataValue, 'Number of Permanent deferral').option;
        // var temporarydeferral = ReportGeneratorService.getCohort(dataValue, 'Number of Temporary deferral').option;
        
        // var bloodDonation = ReportGeneratorService.getCohort(dataValue, 'Number of blood donationd collected from').option;
        // var ageDonation = ReportGeneratorService.getCohort(dataValue, 'Number of blood donations collected from donors').option;

        row.totaldonors = dataValue.totaldonors;
        row.voluntarydonations = dataValue.voluntarydonations;
        row.permanentdeferral = dataValue.permanentdeferral;
        row.temporarydeferral = dataValue.temporarydeferral;
        
        // row.bloodDonation = bloodDonation;
        // row.ageDonation = ageDonation;
        row.lowweight = dataValue.lowweight ;
        row.lowhaemoglobin = dataValue.lowhaemoglobin ;
        row.medicalcondition = dataValue.medicalcondition;
        row.highriskbehaviour = dataValue.highriskbehaviour ;
        row.travelhistory = dataValue.travelhistory ;
        row.testoutcomes = dataValue.testoutcomes ;
        row.otherreasons = dataValue.otherreasons ;
        row.maledonations = dataValue.maledonations ;
        row.femaledonations = dataValue.femaledonations ;
        row.under18donations = dataValue.under18donations;
        row.under24donations = dataValue.under24donations ;
        row.under44donations = dataValue.under44donations ;
        row.under64donations = dataValue.under64donations ;
        row.over64donations = dataValue.over64donations ;
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
        ReportsService.generateWhoReport(period, function (report) {
            $scope.searching = false;

            console.log("kjhkjbkhjb", report);
            var rep = [];
            rep.push(report);
            if (rep.length > 0) {


                var data = ReportGeneratorService.generateWhoReportByDate(rep, initRow, populateRow);
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
        { displayName: gettextCatalog.getString('Total number of voluntary non-remunerated donors'), field: 'totaldonors', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Voluntary non-remunerated donations'), field: 'voluntarydonations', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Number of Permanent deferral'), field: 'permanentdeferral', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Number of Temporary deferral'), field: 'temporarydeferral', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Low weight'), field: 'lowweight', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Low haemoglobin'), field: 'lowhaemoglobin', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Other medical conditions'), field: 'medicalcondition', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('High-risk behaviour'), field: 'highriskbehaviour', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Travel history'), field: 'travelhistory', width: '**', minWidth: 200 },
        { displayName: gettextCatalog.getString('Test Outcomes'), field: 'testoutcomes', width: 100 },
        { displayName: gettextCatalog.getString('Other reasons'), field: 'otherreasons', width: 100 },
        { displayName: gettextCatalog.getString('Male donors'), field: 'maledonations', width: 100 },
        { displayName: gettextCatalog.getString('Female donors'), field: 'femaledonations', width: 100 },
        { displayName: gettextCatalog.getString('under 18 years'), field: 'under18donations', width: 100 },
        { displayName: gettextCatalog.getString('18 to 24 years'), field: 'under24donations', width: 100 },
        { displayName: gettextCatalog.getString('25 to 44 years'), field: 'under44donations', width: 100 },
        { displayName: gettextCatalog.getString('45 to 64 years'), field: 'under64donations', width: 100 },
        { displayName: gettextCatalog.getString('65 years or older'), field: 'over64donations', width: 100 }
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
