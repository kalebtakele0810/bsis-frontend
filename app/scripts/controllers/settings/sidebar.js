'use strict';

angular.module('bsis').controller('SettingsSidebarCtrl', function($scope, RoutingService, ICONS) {

  var routes = [
    {
      path: '/accountSettings',
      subpaths: [
      ]
    }, {
      path: '/configurations',
      subpaths: [
        '/manageConfiguration'
      ]
    }, {
      path: '/deferralReasons',
      subpaths: [
        '/manageDeferralReason'
      ]
    }, {
      path: '/discardReasons',
      subpaths: [
        '/manageDiscardReason'
      ]
    }, {
      path: '/roles',
      subpaths: [
        '/manageRole'
      ]
    }, {
      path: '/users',
      subpaths: [
        '/manageUser'
      ]
    }, {
      path: '/donationTypes',
      subpaths: [
        '/manageDonationType'
      ]
    }, {
      path: '/packTypes',
      subpaths: [
        '/managePackType'
      ]
    }, {
      path: '/adverseEventTypes',
      subpaths: [
        '/manageAdverseEventTypes',
        '/addAdverseEventType',
        '/editAdverseEventType'
      ]
    }, {
      path: '/auditLog',
      subpaths: [
      ]
    }, {
      path: '/locations',
      subpaths: [
        '/manageLocation'
      ]
    }, {
      path: '/componentTypeCombinations',
      subpaths: [
        '/manageComponentTypeCombination'
      ]
    }, {
      path: '/componentTypes',
      subpaths: [
        '/manageComponentType'
      ]
    }, {
      path: '/divisions',
      subpaths: [
        '/manageDivision'
      ]
    }, {
      path: '/bloodTestingRules',
      subpaths: [
        '/manageBloodTestingRule'
      ]
    }, {
      path: '/bloodTests',
      subpaths: [
        '/manageBloodTest'
      ]
    }, {
      path: '/transfusionReactionTypes',
      subpaths: [
        '/manageTransfusionReactionType'
      ]
    }, {
      path: '/dataExport',
      subpaths: []
    }
  ];

  $scope.icons = ICONS;
  $scope.currentPath = RoutingService.getCurrentPath(routes);
});
