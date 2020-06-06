'use strict';

angular.module('bsis')
  .factory('ReportsService', function($http, Api) {
    return {
      generateDonationsReport: function(period, onSuccess, onError) {
        Api.DonationsReport.get({startDate: period.startDate, endDate: period.endDate}, function(report) {
          onSuccess(report);
        }, function(err) {
          onError(err.data);
        });
      },
      generateTTIPrevalenceReport: function(period, onSuccess, onError) {
        Api.TTIPrevalenceReport.get({startDate: period.startDate, endDate: period.endDate}, function(report) {
          onSuccess(report);
        }, function(err) {
          onError(err.data);
        });
      },
      getDonationsReportForm: Api.DonationsReport.getForm,
      generateStockLevelsReport: Api.StockLevelsReport.generate,
      getStockLevelsReportForm: Api.StockLevelsReport.getForm,
      getBloodUnitsIssuedReportForm: Api.BloodUnitsIssuedReport.getForm,
      generateBloodUnitsIssuedReport: Api.BloodUnitsIssuedReport.generate,
      generateDonorsDeferredReport: Api.DonorsDeferredReport.generate,
      getDonorsDeferredReportForm: Api.DonorsDeferredReport.getForm,
      generateUnitsDiscardedReport: Api.UnitsDiscardedReport.generate,
      getUnitsDiscardedReportForm: Api.UnitsDiscardedReport.getForm,
      generateComponentProductionReport: Api.ComponentProductionReport.generate,
      getComponentProductionReportForm: Api.ComponentProductionReport.getForm,
      generateDonorsAdverseEventsReport: Api.DonorsAdverseEventsReport.generate,
      getDonorsAdverseEventsReportForm: Api.DonorsAdverseEventsReport.getForm,
      generateTransfusionsReport: Api.TransfusionsReport.generate,
      getTransfusionsReportForm: Api.TransfusionsReport.getForm,
      getTTIPrevalenceReportForm: Api.TTIPrevalenceReport.getForm,
      generateWhoReport: Api.WhoReport.generate,
      getWhoReportForm: Api.WhoReport.getForm,
      generateDonationSummaryReport: Api.DonationSummaryReport.generate,
      getDonationSummaryReportForm: Api.DonationSummaryReport.getForm
    };
  });
