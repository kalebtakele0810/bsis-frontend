'use strict';
/* global readJSON */

var mockAPI = angular.module('mockAPI', [ // eslint-disable-line
  'ngMockE2E',
  'ngResource'
]);
mockAPI.run(function ($httpBackend, $http, $resource) { // eslint-disable-line

  // login mock
  $httpBackend.whenPOST('/login', {username: 'admin', password: '123'}).respond(
    {
      user: {
        id: '100',
        userId: 'Admin User',
        role: 'admin'
      }
    });
  // pass through all other /login attempts (will respond with a 404 (Not Found))
  $httpBackend.whenPOST('/login').passThrough();

  // login mock
  //$httpBackend.whenGET( new RegExp('.*/users/login-user-details') ).respond(
  /*{ user:{
   id: '100',
   userId: 'Admin User',
   role: 'admin'
   }
   });*/

  // findDonor mock (firstName=sample, lastName=donor)
  $httpBackend.whenGET('/findDonor?firstName=Sample&lastName=Donor').respond(readJSON('test/mockData/donors.json'));

  // pass through all other /findDonor requests (will respond with a 404 (Not Found))
  $httpBackend.whenGET(/findDonor?\w+.*/).passThrough();


  $httpBackend.whenPOST('/login', {username: 'admin', password: '123'}).respond(
    {
      user: {
        id: '100',
        userId: 'Admin User',
        role: 'admin'
      }
    });


  // addDonor mock
  $httpBackend.whenGET('/addDonor').respond(readJSON('test/mockData/donorformfields.json'));
  $httpBackend.whenGET('data/donorformfields.json').passThrough();

  // getDonorFormFields mock
  $httpBackend.whenGET('/getDonorFormFields').respond(readJSON('test/mockData/donorformfields.json'));
  $httpBackend.whenGET('data/donorformfields.json').passThrough();

  // getDonorListFormFields mock
  $httpBackend.whenGET('/getDonorListFormFields').respond(readJSON('test/mockData/donorlistformfields.json'));
  $httpBackend.whenGET('data/donorlistformfields.json').passThrough();

  // getDeferrals mock
  $httpBackend.whenGET('/getDeferrals').respond(readJSON('test/mockData/donordeferrals.json'));
  $httpBackend.whenGET('data/donordeferrals.json').passThrough();

  // getDonations mock
  $httpBackend.whenGET('/getDonations').respond(readJSON('test/mockData/donordonations.json'));
  $httpBackend.whenGET('data/donordonations.json').passThrough();

  // getDonationBatch mock
  $httpBackend.whenGET('/getDonationBatch').respond(readJSON('test/mockData/donationbatch.json'));
  $httpBackend.whenGET('data/donationbatch.json').passThrough();

  // getComponentsByDIN mock (din=12345)
  $httpBackend.whenGET('/getComponentsByDIN?din=12345').respond(readJSON('test/mockData/componentsdin12345.json'));
  $httpBackend.whenGET('data/componentsdin12345.json').passThrough();
  // getComponentsByDIN mock (din=123456)
  $httpBackend.whenGET('/getComponentsByDIN?din=123456').respond(readJSON('test/mockData/componentsdin123456.json'));
  $httpBackend.whenGET('data/componentsdin123456.json').passThrough();
  // pass through all other /getComponentsByDIN requests (will respond with a 404 (Not Found))
  $httpBackend.whenGET(/getComponentsByDIN?\w+.*/).passThrough();

  // getComponentsSummary mock
  $httpBackend.whenGET('/getComponentsSummary').respond(readJSON('test/mockData/componentssummary.json'));
  $httpBackend.whenGET('data/componentssummary.json').passThrough();

  // getDiscardsSummary mock
  $httpBackend.whenGET('/getDiscardsSummary').respond(readJSON('test/mockData/discardssummary.json'));
  $httpBackend.whenGET('data/discardssummary.json').passThrough();

  // getTestBatchBackingForm mock
  $httpBackend.whenGET('/getTestBatchFormFields').respond(readJSON('test/mockData/testbatchformfields.json'));
  $httpBackend.whenGET('data/testbatchformfields.json').passThrough();

  // getTestResultsByDIN mock (din=12345)
  $httpBackend.whenGET('/getTestResultsByDIN?din=12345').respond(readJSON('test/mockData/testresultsdin123456.json'));
  $httpBackend.whenGET('data/testresultsdin123456.json').passThrough();
  // pass through all other /getComponentsByDIN requests (will respond with a 404 (Not Found))
  $httpBackend.whenGET(/getTestResultsByDIN?\w+.*/).passThrough();

  // Don't mock html views
  $httpBackend.whenGET(/views\/\w+.*/).passThrough();
  $httpBackend.whenGET(/^\w+.*/).passThrough();
  $httpBackend.whenPOST(/^\w+.*/).passThrough();
  $httpBackend.whenPUT(/^\w+.*/).passThrough();

});
