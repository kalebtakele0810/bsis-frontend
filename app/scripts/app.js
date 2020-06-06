'use strict';

var app = angular.module('bsis', [ // eslint-disable-line angular/di
  'ngRoute',
  'angular-loading-bar',
  'ui.bootstrap',
  'ngResource',
  'ngTable',
  'xeditable',
  'ui.select',
  'ngSanitize',
  'checklist-model',
  'ngMessages',
  'ui.grid',
  'ui.grid.exporter',
  'ui.grid.pagination',
  'ui.grid.selection',
  'gettext'
])
  .config(function($routeProvider, PERMISSIONS, UI) {

    $routeProvider

    // DEFAULT VIEW - DISPLAY HOME PAGE IF USER AUTHENTICATED
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        permission: PERMISSIONS.AUTHENTICATED
      })

      // LOGIN PAGE
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      // FORGOT PASSWORD PAGE
      .when('/forgotPassword', {
        templateUrl: 'views/forgotPassword.html',
        controller: 'ForgotPasswordCtrl'
      })

      // PASSWORD RESET PAGE
      .when('/passwordReset', {
        templateUrl: 'views/passwordReset.html',
        controller: 'PasswordResetCtrl'
      })

      // LOGOUT PAGE
      .when('/logout', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      // HOME PAGE
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        permission: PERMISSIONS.AUTHENTICATED
      })

      // DONORS URLs
      .when('/donors', {
        redirectTo: '/findDonor',
        permission: PERMISSIONS.VIEW_DONOR_INFORMATION,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/findDonor', {
        templateUrl: 'views/donors/findDonor.html',
        controller: 'FindDonorsCtrl',
        permission: PERMISSIONS.VIEW_DONOR,
        enabled: UI.DONORS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/addDonor', {
        templateUrl: 'views/donors/addDonor.html',
        controller: 'AddDonorCtrl',
        permission: PERMISSIONS.ADD_DONOR,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/duplicateDonors', {
        templateUrl: 'views/donors/duplicateDonors.html',
        controller: 'DonorsDuplicateCtrl',
        permission: PERMISSIONS.VIEW_DUPLICATE_DONORS,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/manageDuplicateDonors', {
        templateUrl: 'views/donors/manageDuplicateDonors.html',
        controller: 'ManageDonorsDuplicateCtrl',
        permission: PERMISSIONS.MERGE_DONORS,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/manageClinic/:id?', {
        templateUrl: 'views/donors/manageClinic.html',
        controller: 'ViewDonationBatchCtrl',
        permission: PERMISSIONS.VIEW_DONATION_BATCH,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/exportDonorList', {
        templateUrl: 'views/donors/donorCommunications.html',
        controller: 'DonorCommunicationsCtrl',
        permission: PERMISSIONS.EXPORT_CLINIC_DATA,
        enabled: UI.DONORS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/viewDonor/:id?', {
        templateUrl: 'views/donors/viewDonor.html',
        controller: 'ViewDonorCtrl',
        permission: PERMISSIONS.VIEW_DONOR,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/manageDonationBatches', {
        templateUrl: 'views/donors/manageDonationBatches.html',
        controller: 'ManageDonationBatchesCtrl',
        permission: PERMISSIONS.VIEW_DONATION_BATCH,
        enabled: UI.DONORS_TAB_ENABLED
      })
      .when('/donorCounselling', {
        templateUrl: 'views/donors/donorCounselling.html',
        controller: 'DonorCounsellingCtrl',
        permission: PERMISSIONS.VIEW_POST_DONATION_COUNSELLING_DONORS,
        reloadOnSearch: false
      })
      .when('/donorCounselling/:donorId', {
        templateUrl: 'views/donors/donorCounsellingDetails.html',
        controller: 'DonorCounsellingDetailsCtrl',
        permission: PERMISSIONS.VIEW_POST_DONATION_COUNSELLING
      })

      // COMPONENTS URLs
      .when('/components', {
        redirectTo: '/addComponentBatch',
        permission: PERMISSIONS.VIEW_COMPONENT_INFORMATION,
        enabled: UI.COMPONENTS_TAB_ENABLED
      })
      .when('/addComponentBatch', {
        templateUrl: 'views/components/addComponentBatch.html',
        controller: 'AddComponentBatchCtrl',
        permission: PERMISSIONS.ADD_COMPONENT_BATCH,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/viewComponentBatches', {
        templateUrl: 'views/components/viewComponentBatches.html',
        controller: 'ViewComponentBatchesCtrl',
        permission: PERMISSIONS.VIEW_COMPONENT_BATCH,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/recordComponents', {
        templateUrl: 'views/components/recordComponents.html',
        controller: 'RecordComponentsCtrl',
        permission: PERMISSIONS.ADD_COMPONENT,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/findComponents', {
        templateUrl: 'views/components/findComponents.html',
        controller: 'FindComponentsCtrl',
        permission: PERMISSIONS.VIEW_COMPONENT,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/discardComponents', {
        templateUrl: 'views/components/discardComponents.html',
        controller: 'DiscardComponentsCtrl',
        permission: PERMISSIONS.DISCARD_COMPONENT,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/findDiscards', {
        templateUrl: 'views/components/findDiscards.html',
        controller: 'FindDiscardsCtrl',
        permission: PERMISSIONS.VIEW_DISCARDS,
        enabled: UI.COMPONENTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/viewComponentBatch/:id', {
        templateUrl: 'views/components/viewComponentBatch.html',
        controller: 'ViewComponentBatchCtrl',
        permission: PERMISSIONS.VIEW_COMPONENT_BATCH,
        enabled: UI.COMPONENTS_TAB_ENABLED
      })

      // TESTING URLs
      .when('/testing', {
        redirectTo: '/manageTestBatches',
        permission: PERMISSIONS.VIEW_TESTING_INFORMATION,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/findTestSamples', {
        templateUrl: 'views/testing/findTestSamples.html',
        controller: 'FindTestSamplesCtrl',
        permission: PERMISSIONS.VIEW_TEST_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/viewTestSample', {
        templateUrl: 'views/testing/viewTestSample.html',
        controller: 'ViewTestSampleCtrl',
        permission: PERMISSIONS.VIEW_TEST_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/manageTestBatches', {
        templateUrl: 'views/testing/manageTestBatches.html',
        controller: 'ManageTestBatchesCtrl',
        permission: PERMISSIONS.VIEW_TEST_BATCH,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/manageTestBatch/:id?', {
        templateUrl: 'views/testing/manageTestBatch.html',
        controller: 'ManageTestBatchCtrl',
        permission: PERMISSIONS.VIEW_TEST_BATCH,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/recordTTIOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/recordTTIOutcomes.html',
        controller: 'RecordTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_TTI_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/reenterTTIOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/reenterTTIOutcomes.html',
        controller: 'ReenterTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_TTI_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/reenterABORhOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/reenterABORhOutcomes.html',
        controller: 'ReenterTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_BLOOD_TYPING_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/recordRepeatTTIOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/recordRepeatTTIOutcomes.html',
        controller: 'RecordTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_TTI_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/recordABORhOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/recordABORhOutcomes.html',
        controller: 'RecordTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_BLOOD_TYPING_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/resolveAmbiguousABORhOutcomes/:id', {
        templateUrl: 'views/testing/resolveAmbiguousABORhOutcomes.html',
        controller: 'ResolveAmbiguousABORhOutcomesCtrl',
        permission: PERMISSIONS.ADD_BLOOD_TYPING_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })
      .when('/recordRepeatABORhOutcomes/:id/:bloodTestType', {
        templateUrl: 'views/testing/recordRepeatABORhOutcomes.html',
        controller: 'RecordTestOutcomesCtrl',
        permission: PERMISSIONS.ADD_BLOOD_TYPING_OUTCOME,
        enabled: UI.TESTING_TAB_ENABLED
      })

      // INVENTORY URLs
      .when('/inventory', {
        redirectTo: '/findInventory',
        permission: PERMISSIONS.VIEW_INVENTORY_INFORMATION,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/findInventory', {
        templateUrl: 'views/inventory/findInventory.html',
        controller: 'FindInventoryCtrl',
        permission: PERMISSIONS.VIEW_INVENTORY_INFORMATION,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/viewStockLevels', {
        templateUrl: 'views/inventory/viewStockLevels.html',
        controller: 'ViewStockLevelsCtrl',
        permission: PERMISSIONS.VIEW_INVENTORY_INFORMATION,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/manageOrders', {
        templateUrl: 'views/inventory/manageOrders.html',
        controller: 'ManageOrdersCtrl',
        permission: PERMISSIONS.ISSUE_COMPONENT,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/fulfilOrder/:id', {
        templateUrl: 'views/inventory/fulfilOrder.html',
        controller: 'FulfilOrderCtrl',
        permission: PERMISSIONS.ISSUE_COMPONENT,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/viewOrder/:id', {
        templateUrl: 'views/inventory/viewOrder.html',
        controller: 'ViewOrderCtrl',
        permission: PERMISSIONS.VIEW_ORDER_FORM,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/viewOrders', {
        templateUrl: 'views/inventory/viewOrders.html',
        controller: 'ViewOrdersCtrl',
        permission: PERMISSIONS.VIEW_ORDER_FORM,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/manageReturns', {
        templateUrl: 'views/inventory/manageReturns.html',
        controller: 'ManageReturnsCtrl',
        permission: PERMISSIONS.ISSUE_COMPONENT,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/recordReturn/:id', {
        templateUrl: 'views/inventory/recordReturn.html',
        controller: 'RecordReturnCtrl',
        permission: PERMISSIONS.ISSUE_COMPONENT,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/viewReturn/:id', {
        templateUrl: 'views/inventory/viewReturn.html',
        controller: 'ViewReturnCtrl',
        permission: PERMISSIONS.ISSUE_COMPONENT,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/viewReturns', {
        templateUrl: 'views/inventory/viewReturns.html',
        controller: 'ViewReturnsCtrl',
        permission: PERMISSIONS.VIEW_INVENTORY_INFORMATION,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/recordTransfusions/:id?', {
        templateUrl: 'views/inventory/recordTransfusions.html',
        controller: 'RecordTransfusionsCtrl',
        permission: PERMISSIONS.ADD_TRANSFUSION_DATA,
        enabled: UI.INVENTORY_TAB_ENABLED
      })
      .when('/findTransfusion', {
        templateUrl: 'views/inventory/findTransfusion.html',
        controller: 'FindTransfusionCtrl',
        permission: PERMISSIONS.VIEW_TRANSFUSION_DATA,
        enabled: UI.INVENTORY_TAB_ENABLED
      })

      // LABELLING URLs
      .when('/labelling', {
        redirectTo: '/findSafeComponents',
        permission: PERMISSIONS.COMPONENT_LABELLING,
        enabled: UI.LABELLING_TAB_ENABLED
      })
      .when('/labelComponents', {
        templateUrl: 'views/labelling/labelComponents.html',
        controller: 'LabelComponentsCtrl',
        permission: PERMISSIONS.COMPONENT_LABELLING,
        enabled: UI.LABELLING_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/findSafeComponents', {
        templateUrl: 'views/labelling/findSafeComponents.html',
        controller: 'FindSafeComponentsCtrl',
        permission: PERMISSIONS.COMPONENT_LABELLING,
        enabled: UI.LABELLING_TAB_ENABLED,
        reloadOnSearch: false
      })

      // REPORTS URLs
      .when('/reports', {
        redirectTo: '/aboRhGroupsReport',
        permission: PERMISSIONS.VIEW_REPORTING_INFORMATION,
        enabled: UI.REPORTS_TAB_ENABLED
      })
      .when('/aboRhGroupsReport', {
        templateUrl: 'views/reports/aboRhGroupsReport.html',
        controller: 'AboRhGroupsReportCtrl',
        permission: PERMISSIONS.DONATIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/donationTypesReport', {
        templateUrl: 'views/reports/donationTypesReport.html',
        controller: 'DonationTypesReportCtrl',
        permission: PERMISSIONS.DONATIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/ttiPrevalenceReport', {
        templateUrl: 'views/reports/ttiPrevalenceReport.html',
        controller: 'TTIPrevalenceReportCtrl',
        permission: PERMISSIONS.TTI_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/bloodUnitsIssuedReport', {
        templateUrl: 'views/reports/bloodUnitsIssuedReport.html',
        controller: 'BloodUnitsIssuedReportCtrl',
        permission: PERMISSIONS.COMPONENTS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/donorsDeferredReport', {
        templateUrl: 'views/reports/donorsDeferredReport.html',
        controller: 'DonorsDeferredReportCtrl',
        permission: PERMISSIONS.DONORS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/unitsDiscardedReport', {
        templateUrl: 'views/reports/unitsDiscardedReport.html',
        controller: 'UnitsDiscardedReportCtrl',
        permission: PERMISSIONS.COMPONENTS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/componentsProducedReport', {
        templateUrl: 'views/reports/componentsProducedReport.html',
        controller: 'ComponentsProducedReportCtrl',
        permission: PERMISSIONS.COMPONENTS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/donorsAdverseEventsReport', {
        templateUrl: 'views/reports/donorsAdverseEventsReport.html',
        controller: 'DonorsAdverseEventsReportCtrl',
        permission: PERMISSIONS.DONATIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/transfusionsReport', {
        templateUrl: 'views/reports/transfusionsReport.html',
        controller: 'TransfusionsReportCtrl',
        permission: PERMISSIONS.TRANSFUSIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/whoGdbsReport', {
        templateUrl: 'views/reports/whoGdbsReport.html',
        controller: 'WhoGdbsReportCtrl',
        permission: PERMISSIONS.DONATIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/donationSummaryReport', {
        templateUrl: 'views/reports/donationSummaryReport.html',
        controller: 'DonationSummaryReportCtrl',
        permission: PERMISSIONS.DONATIONS_REPORTING,
        enabled: UI.REPORTS_TAB_ENABLED,
        reloadOnSearch: false
      })

      // MOBILE URLs
      .when('/mobile', {
        redirectTo: '/lookUp',
        permission: PERMISSIONS.VIEW_MOBILE_CLINIC_INFORMATION,
        enabled: UI.MOBILE_CLINIC_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/lookUp', {
        templateUrl: 'views/mobile/lookUp.html',
        controller: 'MobileCtrl',
        permission: PERMISSIONS.VIEW_MOBILE_CLINIC_INFORMATION,
        enabled: UI.MOBILE_CLINIC_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/mobileDonorCounselling', {
        templateUrl: 'views/mobile/donorCounselling.html',
        controller: 'MobileDonorCounsellingCtrl',
        permission: PERMISSIONS.VIEW_MOBILE_CLINIC_INFORMATION,
        enabled: UI.MOBILE_CLINIC_TAB_ENABLED,
        reloadOnSearch: false
      })
      .when('/mobileClinicExport', {
        templateUrl: 'views/mobile/mobileClinicExport.html',
        controller: 'MobileClinicExportCtrl',
        permission: PERMISSIONS.VIEW_MOBILE_CLINIC_EXPORT,
        enabled: UI.MOBILE_CLINIC_TAB_ENABLED,
        reloadOnSearch: false
      })

      // SETTINGS URLs
      .when('/settings', {
        redirectTo: '/accountSettings',
        permission: PERMISSIONS.AUTHENTICATED
      })
      .when('/configurations', {
        templateUrl: 'views/settings/configurations.html',
        controller: 'ConfigurationsCtrl',
        permission: PERMISSIONS.MANAGE_GENERAL_CONFIGS
      })
      .when('/manageConfiguration/:id?', {
        templateUrl: 'views/settings/manageConfiguration.html',
        controller: 'ManageConfigurationsCtrl',
        permission: PERMISSIONS.MANAGE_GENERAL_CONFIGS
      })
      .when('/accountSettings', {
        templateUrl: 'views/settings/accountSettings.html',
        controller: 'AccountSettingsCtrl',
        permission: PERMISSIONS.AUTHENTICATED
      })
      .when('/users', {
        templateUrl: 'views/settings/users.html',
        controller: 'UsersCtrl',
        permission: PERMISSIONS.MANAGE_USERS
      })
      .when('/manageUser/:id?', {
        templateUrl: 'views/settings/manageUser.html',
        controller: 'ManageUserCtrl',
        permission: PERMISSIONS.MANAGE_USERS
      })
      .when('/roles', {
        templateUrl: 'views/settings/roles.html',
        controller: 'RolesCtrl',
        permission: PERMISSIONS.MANAGE_ROLES
      })
      .when('/manageRole/:id?', {
        templateUrl: 'views/settings/manageRole.html',
        controller: 'ManageRolesCtrl',
        permission: PERMISSIONS.MANAGE_ROLES
      })
      .when('/packTypes', {
        templateUrl: 'views/settings/packTypes.html',
        controller: 'PackTypesCtrl',
        permission: PERMISSIONS.MANAGE_PACK_TYPES
      })
      .when('/managePackType/:id?', {
        templateUrl: 'views/settings/managePackType.html',
        controller: 'ManagePackTypesCtrl',
        permission: PERMISSIONS.MANAGE_PACK_TYPES
      })
      .when('/deferralReasons', {
        templateUrl: 'views/settings/deferralReasons.html',
        controller: 'DeferralReasonsCtrl',
        permission: PERMISSIONS.MANAGE_DEFERRAL_REASONS
      })
      .when('/manageDeferralReason/:id?', {
        templateUrl: 'views/settings/manageDeferralReason.html',
        controller: 'ManageDeferralReasonsCtrl',
        permission: PERMISSIONS.MANAGE_DEFERRAL_REASONS
      })
      .when('/discardReasons', {
        templateUrl: 'views/settings/discardReasons.html',
        controller: 'DiscardReasonsCtrl',
        permission: PERMISSIONS.MANAGE_DISCARD_REASONS
      })
      .when('/manageDiscardReason/:id?', {
        templateUrl: 'views/settings/manageDiscardReason.html',
        controller: 'ManageDiscardReasonsCtrl',
        permission: PERMISSIONS.MANAGE_DISCARD_REASONS
      })
      .when('/donationTypes', {
        templateUrl: 'views/settings/donationTypes.html',
        controller: 'DonationTypesCtrl',
        permission: PERMISSIONS.MANAGE_DONATION_TYPES
      })
      .when('/manageDonationType/:id?', {
        templateUrl: 'views/settings/manageDonationType.html',
        controller: 'ManageDonationTypesCtrl',
        permission: PERMISSIONS.MANAGE_DONATION_TYPES
      })
      .when('/auditLog', {
        templateUrl: 'views/settings/auditLog.html',
        controller: 'AuditLogCtrl',
        permission: PERMISSIONS.VIEW_AUDIT_LOG
      })
      .when('/adverseEventTypes', {
        templateUrl: 'views/settings/adverseEventTypes.html',
        controller: 'AdverseEventTypesCtrl',
        permission: PERMISSIONS.MANAGE_ADVERSE_EVENTS
      })
      .when('/addAdverseEventType', {
        templateUrl: 'views/settings/addAdverseEventType.html',
        controller: 'AddAdverseEventTypeCtrl',
        permission: PERMISSIONS.MANAGE_ADVERSE_EVENTS
      })
      .when('/editAdverseEventType/:id?', {
        templateUrl: 'views/settings/editAdverseEventType.html',
        controller: 'EditAdverseEventTypeCtrl',
        permission: PERMISSIONS.MANAGE_ADVERSE_EVENTS
      })
      .when('/locations', {
        templateUrl: 'views/settings/locations.html',
        controller: 'LocationsCtrl',
        permission: PERMISSIONS.MANAGE_LOCATIONS,
        reloadOnSearch: false
      })
      .when('/manageLocation/:id?', {
        templateUrl: 'views/settings/manageLocation.html',
        controller: 'ManageLocationCtrl',
        permission: PERMISSIONS.MANAGE_LOCATIONS
      })
      .when('/componentTypes', {
        templateUrl: 'views/settings/componentTypes.html',
        controller: 'ComponentTypesCtrl',
        permission: PERMISSIONS.MANAGE_COMPONENT_TYPES
      })
      .when('/manageComponentType/:id?', {
        templateUrl: 'views/settings/manageComponentType.html',
        controller: 'ManageComponentTypeCtrl',
        permission: PERMISSIONS.MANAGE_COMPONENT_TYPES
      })
      .when('/manageComponentTypeCombination/:id?', {
        templateUrl: 'views/settings/manageComponentTypeCombination.html',
        controller: 'ManageComponentTypeCombinationCtrl',
        permission: PERMISSIONS.MANAGE_COMPONENT_COMBINATIONS
      })
      .when('/componentTypeCombinations', {
        templateUrl: 'views/settings/componentTypeCombinations.html',
        controller: 'ComponentTypeCombinationsCtrl',
        permission: PERMISSIONS.MANAGE_COMPONENT_COMBINATIONS
      })
      .when('/divisions', {
        templateUrl: 'views/settings/divisions.html',
        controller: 'DivisionsCtrl',
        permission: PERMISSIONS.MANAGE_DIVISIONS,
        reloadOnSearch: false
      })
      .when('/manageDivision', {
        templateUrl: 'views/settings/manageDivision.html',
        controller: 'ManageDivisionCtrl',
        permission: PERMISSIONS.MANAGE_DIVISIONS
      })
      .when('/manageDivision/:id', {
        templateUrl: 'views/settings/manageDivision.html',
        controller: 'ManageDivisionCtrl',
        permission: PERMISSIONS.MANAGE_DIVISIONS
      })
      .when('/bloodTests', {
        templateUrl: 'views/settings/bloodTests.html',
        controller: 'BloodTestsCtrl',
        permission: PERMISSIONS.MANAGE_BLOOD_TESTS
      })
      .when('/manageBloodTest/:id?', {
        templateUrl: 'views/settings/manageBloodTest.html',
        controller: 'ManageBloodTestCtrl',
        permission: PERMISSIONS.MANAGE_BLOOD_TESTS
      })
      .when('/bloodTestingRules', {
        templateUrl: 'views/settings/bloodTestingRules.html',
        controller: 'BloodTestingRulesCtrl',
        permission: PERMISSIONS.MANAGE_BLOOD_TESTING_RULES
      })
      .when('/manageBloodTestingRule/:id?', {
        templateUrl: 'views/settings/manageBloodTestingRule.html',
        controller: 'ManageBloodTestingRuleCtrl',
        permission: PERMISSIONS.MANAGE_BLOOD_TESTING_RULES
      })
      .when('/transfusionReactionTypes', {
        templateUrl: 'views/settings/transfusionReactionTypes.html',
        controller: 'TransfusionReactionTypesCtrl',
        permission: PERMISSIONS.MANAGE_TRANSFUSION_REACTION_TYPES
      })
      .when('/manageTransfusionReactionType/:id?', {
        templateUrl: 'views/settings/manageTransfusionReactionType.html',
        controller: 'ManageTransfusionReactionTypeCtrl',
        permission: PERMISSIONS.MANAGE_TRANSFUSION_REACTION_TYPES
      })
      .when('/dataExport', {
        templateUrl: 'views/settings/dataExport.html',
        controller: 'DataExportCtrl',
        permission: PERMISSIONS.DATA_EXPORT
      })
      .otherwise({
        redirectTo: '/home'
      });
  })

  .config(function(uibDatepickerConfig) {
    uibDatepickerConfig.formatYear = 'yy';
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerConfig.startingDay = 1;
  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }])

  .run(function(editableOptions) {
    editableOptions.theme = 'bs3';
  })

    // Set the language of BSIS
  .run(function(gettextCatalog, SYSTEMCONFIG) {
    gettextCatalog.setCurrentLanguage(SYSTEMCONFIG.language);
    if (SYSTEMCONFIG.languageDebug) {
      gettextCatalog.debug = SYSTEMCONFIG.languageDebug;
    }
  })

  .run(['$rootScope', '$location', 'AuthService', function($rootScope, $location) {

    // on route change, check to see if user has appropriate permissions

    $rootScope.$on('$routeChangeStart', function(scope, next) { //eslint-disable-line angular/on-watch

      // set initial accessDenied value to false
      if (!($rootScope.accessDenied === true && $location.path() == '/home')) {
        $rootScope.accessDenied = false;
      }

      /* eslint-disable angular/no-private-call */
      var permission = next.$$route.permission;
      var enabled = next.$$route.enabled;
      /* eslint-enable angular/no-private-call */

      if (enabled === 'false' || enabled === false) {
        $rootScope.accessDenied = true;
        $location.path('/home');
      }

      // if the required permission is not in the current user's permissions list, redirect to home page and display alert
      if (enabled !== true && angular.isDefined(permission) && $rootScope.sessionUserPermissions.indexOf(permission) <= -1) {
        $rootScope.accessDenied = true;
        $location.path('/home');
      }
    });

  }])

  .run(['$rootScope', '$location', 'AuthService', 'PERMISSIONS', function($rootScope, $location, AuthService, PERMISSIONS) {

    $rootScope.$on('$locationChangeStart', function() { //eslint-disable-line angular/on-watch


      // Retrieve the session from storage
      var consoleSession = AuthService.getSession();

      //used to control if header is displayed
      $rootScope.displayHeader = false;

      //check if session exists
      if (consoleSession) {
        //check if session has expired
        var currentTime = Date.now();
        if (currentTime >= consoleSession.expires) {
          //session expired - user needs to log in
          AuthService.logout();
          $location.path('/login');
        } else {
          AuthService.refreshSession();

          if ($location.path() == '/login') {
            $location.path('/home');
          }

          // Check if the user must reset their password
          if (AuthService.getLoggedOnUser().passwordReset) {
            $location.path('/passwordReset');
          }
        }

      } else {
        // no session - user needs to log in
        if (['/login', '/forgotPassword'].indexOf($location.path()) === -1) {
          $location.path('/login');
        }
      }

      if ($location.path() === '/testing') {
        // Initial routing for testing page
        if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_TEST_BATCH) !== -1) {
          $location.path('/manageTestBatches');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_TEST_OUTCOME) !== -1) {
          $location.path('/viewTestSample');
        } else {
          $location.path('/home');
        }
      }

      if ($location.path() === '/donors') {
        // Initial routing for donors page
        if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_DONOR) > -1) {
          $location.path('/findDonor');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_DONATION_BATCH) > -1) {
          $location.path('/manageDonationBatches');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.EXPORT_CLINIC_DATA) > -1) {
          $location.path('/exportDonorList');
        } else {
          $location.path('/home');
        }
      }

      if ($location.path() === '/components') {
        // Initial routing for components page
        if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.ADD_COMPONENT_BATCH) > -1) {
          $location.path('/addComponentBatch');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_COMPONENT_BATCH) > -1) {
          $location.path('/viewComponentBatches');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.ADD_COMPONENT) > -1) {
          $location.path('/recordComponents');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_COMPONENT) > -1) {
          $location.path('/findComponents');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.DISCARD_COMPONENT) > -1) {
          $location.path('/discardComponents');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_DISCARDS) > -1) {
          $location.path('/findDiscards');
        } else {
          $location.path('/home');
        }
      }

      if ($location.path() === '/inventory') {
        if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_INVENTORY_INFORMATION) > -1) {
          $location.path('/findInventory');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.VIEW_INVENTORY_INFORMATION) > -1) {
          $location.path('/viewStockLevels');
        }
      }

      if ($location.path() === '/reports') {
        // Initial routing for reports page
        if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.DONATIONS_REPORTING) > -1) {
          $location.path('/aboRhGroupsReport');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.TTI_REPORTING) > -1) {
          $location.path('/ttiPrevalenceReport');
        } else if ($rootScope.sessionUserPermissions.indexOf(PERMISSIONS.COMPONENTS_REPORTING) > -1) {
          $location.path('/bloodUnitsIssuedReport');
        } else {
          $location.path('/home');
        }
      }

    });
  }])

  .directive('bsisTabTo', [function() {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        el.bind('keyup', function() {
          if (this.value.length === this.maxLength) {
            var element = document.getElementById(attrs.bsisTabTo);
            if (element) {
              element.focus();
            }
          }
        });
      }
    };
  }])

  /* Custom directive to capitalize the first lettter of input fields */
  .directive('capitalizeFirstLetter', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue) {
            var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
            if (capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }
            return capitalized;
          }
          return inputValue;
        };
        modelCtrl.$parsers.push(capitalize);
      }
    };
  })

  /* Custom datepicker directive, makes use of angular-ui datepicker */
  .directive('dateselect', function($compile) {
    return {
      restrict: 'E',
      require: '^ngModel',
      replace: 'true',
      scope: {
        ngModel: '=',
        ngRequired: '=',
        ngDisabled: '=',
        dateOptions: '=',
        minDate: '=',
        maxDate: '=',
        format: '=',
        initDate: '='

      },
      link: function($scope, element) {

        $scope.calIcon = $scope.calIcon || 'fa-calendar';

        $scope.open = function(event) {
          event.preventDefault();
          event.stopPropagation();
          $scope.opened = true;
        };

        $scope.clear = function() {
          $scope.ngModel = null;
        };

        var unwatch = $scope.$watch('ngDisabled', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $compile(element.contents())($scope);
          }
        });

        $scope.$on('$destroy', function() {
          unwatch();
        });
      },
      templateUrl: 'views/template/dateselect.html'
    };
  })

  .directive('dateselectEnd', function($compile) {
    return {
      restrict: 'E',
      require: ['^ngModel'],
      replace: 'true',
      scope: {
        ngModel: '=',
        ngRequired: '=',
        ngDisabled: '=',
        dateOptions: '=',
        minDate: '=',
        maxDate: '=',
        format: '=',
        initDate: '='

      },
      link: function(scope, element, attrs, ctrl) {

        scope.calIcon = scope.calIcon || 'fa-calendar';

        scope.open = function(event) {
          event.preventDefault();
          event.stopPropagation();
          scope.opened = true;
        };

        scope.clear = function() {
          scope.ngModel = null;
        };

        var ngModel = ctrl[0];
        if (!ngModel) {
          return;
        }

        scope.$watch(
          function() {
            return ngModel.$modelValue;
          },
          function(modelValue) {
            if (modelValue) {
              var endOfDay = moment(modelValue).endOf('day').toDate();
              ngModel.$setViewValue(endOfDay);
              ngModel.$render();
            }
          },
          true);

        var unwatch = scope.$watch('ngDisabled', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $compile(element.contents())(scope);
          }
        });

        scope.$on('$destroy', function() {
          unwatch();
        });

      },
      templateUrl: 'views/template/dateselect.html'
    };
  })

  /* Custom haemoglobinValue directive to return haemeglobin information in the format: haemoglobinCount hbUnit ( hbQualitativeValue ) */
  .directive('haemoglobinValue', function(ConfigurationsService, DONATION) {
    return {
      replace: 'true',
      restrict: 'E',
      scope: {
        hbUnit: '=?',
        haemoglobinCount: '=',
        hbNumericValue: '=?',
        haemoglobinLevel: '=',
        hbQualitativeValue: '=?'
      },
      link: function(scope) {
        if (angular.isUndefined(scope.hbUnit)) {
          scope.hbUnit = DONATION.HBUNIT;
        }
        if (angular.isUndefined(scope.hbNumericValue)) {
          scope.hbNumericValue = ConfigurationsService.getBooleanValue('donation.hbNumericValue');
        }
        if (angular.isUndefined(scope.hbQualitativeValue)) {
          scope.hbQualitativeValue = ConfigurationsService.getBooleanValue('donation.hbQualitativeValue');
        }
      },
      templateUrl: function() {
        return 'views/template/haemoglobin.html';
      }
    };
  })


  /*  Custom directive to check if user has associated permission
   example use: <span has-permission="{{permissions.SOME_PERMISSION}}">
   */
  .directive('hasPermission', ['$rootScope', function($rootScope) {
    return {
      link: function(scope, element, attrs) {
        // determine if user has permission to view the element -
        function showOrHide(permission, enabled) {
          var hasPermission = false;
          // if user has the appropriate permission, set hasPermission to TRUE
          if ($rootScope.sessionUserPermissions.indexOf(permission) > -1) {
            hasPermission = true;
          }


          if (enabled === 'true') {
            // disable the element if the user does not have the appropriate permission
            element.attr('disabled', !hasPermission);
          } else if (enabled === 'false') {
            // disable the element if the section is not enabled
            element.attr('disabled', true);
          } else if (!hasPermission) {
            //if the user does not have the permissions and enabled is not set, then remove the element.
            element.remove();
          }

        }

        // if the permission is not an empty string, determine if element should be displayed
        if (attrs.hasPermission !== '') {
          var str = attrs.hasPermission.split(':');
          var permissionStr = str[0];
          var enabledStr = str[1];
          showOrHide(permissionStr, enabledStr);
        }
      }
    };
  }])

  /*  Custom directive to check if user has associated permissions - use a semicolon (;) separated list of permissions
   example use: <span has-permissions="{{permissions.SOME_PERMISSION}};{{permissions.SOME_PERMISSION_#2}}">
   */
  .directive('hasPermissions', ['$rootScope', function($rootScope) {
    return {
      link: function(scope, element, attrs) {
        // determine if user has permissions to view the element -
        function showOrHide(permissions) {
          var hasPermissions = true;
          for (var permission in permissions) {
            // if user doesn't have one of the appropriate permissions, set to FALSE
            if ($rootScope.sessionUserPermissions.indexOf(permissions[permission]) < 0) {
              hasPermissions = false;
            }
          }

          // remove the element if the user does not have the appropriate permission
          if (!hasPermissions) {
            element.remove();
          }
        }

        // if the permission is not an empty string, determine if element should be displayed
        if (attrs.hasPermissions !== '') {
          var permissionsArray = attrs.hasPermissions.split(';');
          showOrHide(permissionsArray);
        }
      }
    };
  }])

  /*  Custom directive to calculate age from birthDate
   example use: <span calculate-age dob="{{donor.birthDate}}" age="age">{{age}}</span>
   */
  .directive('calculateAge', function($timeout) {
    return {
      restrict: 'EA',
      scope: {
        dob: '@',
        age: '='
      },
      link: function($scope) {
        function doCalculation() {
          $timeout(function() {
            var age = '';
            if ($scope.dob === '') {
              $scope.age = '';
              doCalculation();
            } else {
              var today = new Date();
              var birthDate = new Date($scope.dob);
              age = today.getFullYear() - birthDate.getFullYear();
              var m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              $scope.age = age;
            }
          }, 100);
        }

        doCalculation();
      }

    };
  })

  .directive('selectOnFocus', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.on('click', function() {
          this.select();
        });
      }
    };
  })


  .directive('integer', ['REGEX', function(REGEX) {
    var INTEGER_REGEXP = REGEX.INTEGER;
    return {
      require: 'ngModel',
      link: function($scope, elm, attrs, ctrl) {
        ctrl.$validators.integer = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // empty input is valid
            return true;
          }
          if (INTEGER_REGEXP.test(viewValue)) {
            // input valid
            return true;
          }
          // input invalid
          return false;
        };
      }
    };
  }])

  .directive('decimal', ['REGEX', function(REGEX) {
    var DECIMAL_REGEXP = REGEX.DECIMAL;
    return {
      require: 'ngModel',
      link: function($scope, elm, attrs, ctrl) {
        ctrl.$validators.decimal = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // empty input is valid
            return true;
          }
          if (DECIMAL_REGEXP.test(viewValue)) {
            // input valid
            return true;
          }
          // input invalid
          return false;
        };
      }
    };
  }])

  .directive('alphaName', ['REGEX', function(REGEX) {
    var ALPHA_REGEXP = REGEX.NAME;
    return {
      require: 'ngModel',
      link: function($scope, elm, attrs, ctrl) {
        ctrl.$validators.alphaName = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // empty input is valid
            return true;
          }
          if (ALPHA_REGEXP.test(viewValue)) {
            // input valid
            return true;
          }
          // input invalid
          return false;
        };
      }
    };
  }])

  .directive('compareTo', function() {
    return {
      require: 'ngModel',
      scope: {
        otherModelValue: '=compareTo'
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch('otherModelValue', function() {
          ngModel.$validate();
        });
      }
    };
  })

  .directive('uiSelectRequired', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ctrl) {
        ctrl.$validators.uiSelectRequired = function(modelValue, viewValue) {
          if (attr.uiSelectRequired) {
            var isRequired = scope.$eval(attr.uiSelectRequired);
            if (isRequired == false) {
              return true;
            }
          }
          var determineVal;
          if (angular.isArray(modelValue)) {
            determineVal = modelValue;
          } else if (angular.isArray(viewValue)) {
            determineVal = viewValue;
          } else {
            return false;
          }
          return determineVal.length > 0;
        };
      }
    };
  })

  .directive('uiDateRange', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ctrl) {
        ctrl.$validators.datesOutOfRange = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          // initialise the start and end dates
          var startDateValue = attr.uiDateStart;
          var endDateValue = attr.uiDateEnd;
          if (!startDateValue) {
            startDateValue = modelValue; // assume modelValue is the start date
          } else if (!endDateValue) {
            endDateValue = modelValue; // assume modelValue is the end date
          }
          if (startDateValue && endDateValue) {
            var startDate = moment(startDateValue).startOf('day');
            var endDate = moment(endDateValue).startOf('day');
            // check the range, if empty only previous check will be evaluated
            if (attr.uiDateRange) {
              var range = attr.uiDateRange.split(',');
              if (endDate.isAfter(startDate.add(range[0], range[1]))) {
                return false;
              }
            }
          }
          return true;
        };
        ctrl.$validators.invalidDateRange = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          // initialise the start and end dates
          var startDateValue = attr.uiDateStart;
          var endDateValue = attr.uiDateEnd;
          if (!startDateValue) {
            startDateValue = modelValue; // assume modelValue is the start date
          } else if (!endDateValue) {
            endDateValue = modelValue; // assume modelValue is the end date
          }
          if (startDateValue && endDateValue) {
            var startDate = moment(startDateValue).startOf('day');
            var endDate = moment(endDateValue).startOf('day');
            // check that start date is before end date
            if (startDate.isAfter(endDate)) {
              return false;
            }
          }
          return true;
        };
        scope.$watch(function() {
          return attr.uiDateStart;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ctrl.$validate();
        });
        scope.$watch(function() {
          return attr.uiDateEnd;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-end changes
          ctrl.$validate();
        });
      }
    };
  })

  .directive('timeIsAfter', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.invalidTimeRange = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var startTime = new Date(attr.timeIsAfter);
          var endTime = new Date(modelValue);
          return startTime <= endTime;
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.timeIsAfter;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  })

  .directive('timeNotSameAs', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.sameTimeEntered = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var startTime = new Date(attr.timeNotSameAs);
          var endTime = new Date(modelValue);
          return (moment.duration(moment(endTime).diff(moment(startTime))).asMinutes()) >= 1;
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.timeNotSameAs;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  })

  .directive('timeNotExceededAs', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.exceededTimeEntered = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var startTime = new Date(attr.timeNotExceededAs);
          var endTime = new Date(modelValue);
          return (moment.duration(moment(endTime).diff(moment(startTime))).asMinutes()) >= 15;
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.timeNotExceededAs;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  })

  .directive('dateTimeNotInFuture', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.dateInFuture = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var timeAttr = attr.dateTimeNotInFuture;
          // If time is a different model value, get it as an attribute. If not, use time from modelValue
          var date = angular.copy(new Date(modelValue));
          var time = angular.copy(new Date(timeAttr));
          if (!timeAttr) {
            time = date;
          }
          var dateTime = moment(date).hour(time.getHours()).minutes(time.getMinutes());
          return dateTime <= moment().toDate();
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.dateTimeNotInFuture;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  })
  .directive('dateTimeAfter', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.dateTimeAfter = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var dateTimeAttr = angular.copy(new Date(attr.dateTimeAfter));
          var dateTimeModel = angular.copy(new Date(modelValue));
          return dateTimeModel > dateTimeAttr;
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.dateAfter;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  })
  .directive('maxDecimalDigits', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {
        ngModel.$validators.maxDecimalDigits = function(modelValue) {
          if (!modelValue) {
            return true;
          }
          var maxDecimalDigits = attr.maxDecimalDigits;
          var actualDecimalDigits = (modelValue.toString().split('.')[1] || []).length;
          return (actualDecimalDigits <= maxDecimalDigits);
        };
        // Watch and unwatch attr
        var unwatch = scope.$watch(function() {
          return attr.maxDecimalDigits;
        }, function() {
          // force the controller to re-validate if the attribute ui-date-start changes
          ngModel.$validate();
        });
        scope.$on('$destroy', function() {
          unwatch();
        });
      }
    };
  });

var UI = {ADDRESS: {}};
var DONATION = {DONOR: {}};
// initialize system & user config before app starts
(function() {

  function getVersions(url) {
    var versionInfo = {
      backend: {
        version : 'unknown',
        buildNumber : 'unknown'
      },
      frontend: {
        version : 'unknown',
        buildNumber : 'unknown'
      }
    };

    /*eslint-disable angular/module-getter */
    app.constant('VERSION', versionInfo);
    /*eslint-enable angular/module-getter */

    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var $log = initInjector.get('$log');

    return $http.get(url + '/version').then(function(backendVersionResponse) {
      // load backend versions
      if (backendVersionResponse.data.version) {
        versionInfo.backend.version = backendVersionResponse.data.version.version;
        versionInfo.backend.buildNumber = backendVersionResponse.data.version.buildNumber;
      }
      // load frontend versions
      return $http.get('version.json').then(function(frontendVersionResponse) {
        versionInfo.frontend.version = frontendVersionResponse.data.version;
        versionInfo.frontend.buildNumber = frontendVersionResponse.data.buildNumber;
      }, function(err) {
        $log.error(err);
      });
    }, function(err) {
      $log.error(err);
    });
  }

  function getConfigConstantsAndVersions(response) {
    app.constant('SYSTEMCONFIG', response.data);
    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var url = 'http://' + response.data.apiHost + ':' + response.data.apiPort + '/' + response.data.apiApp;

    return $http.get(url + '/configurations').then(function(configResponse) {
      app.constant('USERCONFIG', configResponse.data);

      /*eslint-disable angular/module-getter */
      app.constant('UI', UI);
      app.constant('DONATION', DONATION);
      /*eslint-enable angular/module-getter */

      var config = configResponse.data.configurations;

      // initialise date/time format constants
      for (var i = 0, tot = config.length; i < tot; i++) {
        if (config[i].name == 'dateFormat') {
          app.constant('DATEFORMAT', config[i].value);
        } else if (config[i].name == 'dateTimeFormat') {
          app.constant('DATETIMEFORMAT', config[i].value);
        } else if (config[i].name == 'timeFormat') {
          app.constant('TIMEFORMAT', config[i].value);
        } else if (config[i].name == 'ui.donorsTabEnabled') {  //Home Tabs constants
          UI.DONORS_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.componentsTabEnabled') {
          UI.COMPONENTS_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.testingTabEnabled') {
          UI.TESTING_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.labellingTabEnabled') {
          UI.LABELLING_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.inventoryTabEnabled') {
          UI.INVENTORY_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.reportsTabEnabled') {
          UI.REPORTS_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.mobileClinicTabEnabled') {
          UI.MOBILE_CLINIC_TAB_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.addressLine1.enabled') { //Address fields constants
          UI.ADDRESS.ADDRESS_LINE_1_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.addressLine1.displayName') {
          UI.ADDRESS.ADDRESS_LINE_1_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.addressLine2.enabled') {
          UI.ADDRESS.ADDRESS_LINE_2_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.addressLine2.displayName') {
          UI.ADDRESS.ADDRESS_LINE_2_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.cityTownVillage.enabled') {
          UI.ADDRESS.CITY_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.cityTownVillage.displayName') {
          UI.ADDRESS.CITY_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.province.enabled') {
          UI.ADDRESS.PROVINCE_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.province.displayName') {
          UI.ADDRESS.PROVINCE_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.state.enabled') {
          UI.ADDRESS.STATE_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.state.displayName') {
          UI.ADDRESS.STATE_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.districtRegion.enabled') {
          UI.ADDRESS.DISTRICT_REGION_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.districtRegion.displayName') {
          UI.ADDRESS.DISTRICT_REGION_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.country.enabled') {
          UI.ADDRESS.COUNTRY_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.country.displayName') {
          UI.ADDRESS.COUNTRY_NAME = config[i].value;
        } else if (config[i].name == 'ui.address.postalCode.enabled') {
          UI.ADDRESS.POSTAL_CODE_ENABLED = config[i].value;
        } else if (config[i].name == 'ui.address.postalCode.displayName') {
          UI.ADDRESS.POSTAL_CODE_NAME = config[i].value;
        } else if (config[i].name == 'donation.bpUnit') {  // Donor form units
          DONATION.BPUNIT = config[i].value;
        } else if (config[i].name == 'donation.hbUnit') {
          DONATION.HBUNIT = config[i].value;
        } else if (config[i].name == 'donation.weightUnit') {
          DONATION.WEIGHTUNIT = config[i].value;
        } else if (config[i].name == 'donation.pulseUnit') {
          DONATION.PULSEUNIT = config[i].value;
        } else if (config[i].name == 'donation.donor.bpSystolicMin') { // donor form constants
          DONATION.DONOR.BP_SYSTOLIC_MIN = config[i].value;
        } else if (config[i].name == 'donation.donor.bpSystolicMax') {
          DONATION.DONOR.BP_SYSTOLIC_MAX = config[i].value;
        } else if (config[i].name == 'donation.donor.bpDiastolicMin') {
          DONATION.DONOR.BP_DIASTOLIC_MIN = config[i].value;
        } else if (config[i].name == 'donation.donor.bpDiastolicMax') {
          DONATION.DONOR.BP_DIASTOLIC_MAX = config[i].value;
        } else if (config[i].name == 'donation.donor.hbMin') {
          DONATION.DONOR.HB_MIN = config[i].value;
        } else if (config[i].name == 'donation.donor.hbMax') {
          DONATION.DONOR.HB_MAX = config[i].value;
        } else if (config[i].name == 'donation.donor.weightMin') {
          DONATION.DONOR.WEIGHT_MIN = config[i].value;
        } else if (config[i].name == 'donation.donor.weightMax') {
          DONATION.DONOR.WEIGHT_MAX = config[i].value;
        } else if (config[i].name == 'donation.donor.pulseMin') {
          DONATION.DONOR.PULSE_MIN = config[i].value;
        } else if (config[i].name == 'donation.donor.pulseMax') {
          DONATION.DONOR.PULSE_MAX = config[i].value;
        } else if (config[i].name == 'donation.dinLength') {
          DONATION.DIN_LENGTH = config[i].value;
        }
      }

      // Once the config is fetched, get the versions
      return getVersions(url);
    }, function() {
      // Handle error case
      app.constant('CONFIGAPI', 'No Config Loaded');
    });
  }

  function initializeConfig() {

    var internalConfigPath = 'config/bsis.json';
    var externalConfigPath = 'bsis.json';

    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');

    return $http.get(externalConfigPath).then(function(response) {
      // get api config from external file
      return getConfigConstantsAndVersions(response);
    }, function() {
      // external file not found, get api config from internal file
      return $http.get(internalConfigPath).then(function(response) {
        return getConfigConstantsAndVersions(response);
      }, function() {
        // Handle error case
        app.constant('SYSTEMCONFIG', 'No Config Loaded');
      });
    });
  }

  function bootstrapApplication() {
    angular.element(document).ready(function() {
      angular.bootstrap(document, ['bsis']);
    });
  }

  initializeConfig().then(bootstrapApplication);

}());
