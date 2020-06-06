'use strict';

angular.module('bsis')

  .factory('Api', function($resource, $http, SYSTEMCONFIG) {

    var url = 'http://' + SYSTEMCONFIG.apiHost + ':' + SYSTEMCONFIG.apiPort + '/' + SYSTEMCONFIG.apiApp;

    return {
      User: $resource(url + '/users/login-user-details', {}, {
        get: {
          method: 'GET'
        }
      }),

      Users: $resource(url + '/users/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      Roles: $resource(url + '/roles/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      Permissions: $resource(url + '/roles/permissions'),

      Donor: $resource(url + '/donors/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      Deferrals: $resource(url + '/deferrals/:id', null,
        {
          update: {method: 'PUT'},
          end: {
            url: url + '/deferrals/:id/end',
            method: 'PUT',
            params: {id: '@id'}
          }
        }
      ),

      deferralReasons: $resource(url + '/deferralreasons/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      Donations: $resource(url + '/donations/:id', {id: '@id'}, {
        update: {
          method: 'PUT'
        },
        bloodTypingResolutions: {
          method: 'POST',
          url: url + '/donations/bloodTypingResolutions'
        },
        getEditForm: {
          method: 'GET',
          url: url + '/donations/:id/form'
        },
        findByDin: {
          method: 'GET',
          url: url + '/donations'
        },
        search: {
          method: 'GET',
          url: url + '/donations/search'
        }
      }),

      DonationBatches: $resource(url + '/donationbatches/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      TestBatches: $resource(url + '/testbatches/:id', {id: '@id'}, {
        update: {
          method: 'PUT'
        },
        getTestBatchDonations: {
          method: 'GET',
          url: url + '/testbatches/:id/donations',
          params: {
            id: '@id',
            bloodTypingMatchStatus: '@bloodTypingMatchStatus'
          }
        },
        getTestBatchForm: {
          method: 'GET',
          url: url + '/testbatches/form'
        },
        search: {
          method: 'GET',
          url: url + '/testbatches/search'
        },
        addDonationsToTestBatch: {
          method: 'PUT',
          url: url + '/testbatches/:id/addDonations',
          params: {
            id: '@id'
          }
        },
        removeDonationsFromTestBatch: {
          method: 'PUT',
          url: url + '/testbatches/:id/removeDonations',
          params: {
            id: '@id'
          }
        }
      }),

      ComponentBatches: $resource(url + '/componentbatches/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      ComponentBatchesSearch: $resource(url + '/componentbatches/search', {},
        {
          query: {
            method: 'GET',
            params: {
              startCollectionDate: '@startCollectionDate',
              endCollectionDate: '@endCollectionDate'
            }
          }
        }
      ),

      DonorFormFields: $resource(url + '/donors/form'),
      DonationsFormFields: $resource(url + '/donations/form'),
      DeferralsFormFields: $resource(url + '/deferrals/form'),
      DonorCommunicationsFormFields: $resource(url + '/donorcommunications/form'),

      ComponentTypes: $resource(url + '/componenttypes/:id', {id: '@id'}, {
        getAll: {
          method: 'GET',
          url: url + '/componenttypes/search'
        },
        update: {method: 'PUT'}
      }),

      DonationBatchFormFields: $resource(url + '/donationbatches/form'),
      TTITestingFormFields: $resource(url + '/ttitests/form'),
      BloodGroupTestingFormFields: $resource(url + '/bloodgroupingtests/form'),
      ComponentBatchesFormFields: $resource(url + '/componentbatches/form'),

      Donors: $resource(url + '/donors/:id', {id: '@id'}),

      FindDonors: $resource(url + '/donors/search', {},
        {
          query: {
            method: 'GET',
            params: {
              firstName: '@firstName',
              lastName: '@lastName',
              donorNumber: '@donorNumber',
              donationIdentificationNumber: '@donationIdentificationNumber',
              usePhraseMatch: '@usePhraseMatch'
            }
          }
        }
      ),

      DonorOverview: $resource(url + '/donors/:id/overview'),
      DonorDonations: $resource(url + '/donors/:id/donations'),
      DonorDeferrals: $resource(url + '/donors/:id/deferrals'),
      DonorBarcode: $resource(url + '/donors/:id/print'),

      DonorCommunicationsSearch: $resource(url + '/donorcommunications/search', {},
        {
          query: {
            method: 'GET',
            params: {
              bloodGroups: '@bloodGroups',
              venues: '@venues',
              clinicDate: '@clinicDate',
              lastDonationFromDate: '@lastDonationFromDate',
              lastDonationToDate: '@lastDonationToDate',
              anyBloodGroup: '@anyBloodGroup',
              noBloodGroup: '@noBloodGroup'
            }
          }
        }
      ),

      DonorSummaries: $resource(url + '/donors/summaries'),

      AllDonorDuplicates: $resource(url + '/donors/duplicates/all'),

      DonorDuplicates: $resource(url + '/donors/duplicates', {},
        {
          query: {
            method: 'GET',
            params: {donorNumber: '@donorNumber'}
          }
        }
      ),

      DonorPreviewMergeDuplicates: $resource(url + '/donors/duplicates/merge/preview', {},
        {
          query: {
            method: 'POST',
            params: {donorNumbers: '@donorNumbers'}
          }
        }
      ),

      DonorMergeDuplicates: $resource(url + '/donors/duplicates/merge', {},
        {
          query: {
            method: 'POST',
            params: {donorNumber: '@donorNumber'}
          }
        }
      ),

      Components: $resource(url + '/components/:id', {id: '@id'}, {
        find: {
          method: 'GET',
          url: url + '/components'
        },
        findByDIN: {
          method: 'GET',
          url: url + '/components/donations/:donationIdentificationNumber'
        },
        search: {
          method: 'GET',
          url: url + '/components/search'
        },
        record: {
          method: 'POST',
          url: url + '/components/recordcombinations'
        },
        getComponentForm: {
          method: 'GET',
          url: url + '/components/form'
        },
        getDiscardForm: {
          method: 'GET',
          url: url + '/components/discard/form'
        },
        discard: {
          method: 'PUT',
          url: url + '/components/discard'
        },
        unprocess: {
          method: 'PUT',
          url: url + '/components/:id/unprocess'
        },
        undiscard: {
          method: 'PUT',
          url: url + '/components/undiscard'
        },
        preProcess: {
          method: 'PUT',
          url: url + '/components/:id/preprocess',
          params: {
            id: '@id'
          }
        },
        recordChildWeight: {
          method: 'PUT',
          url: url + '/components/:id/recordchildweight',
          params: {
            id: '@id'
          }
        }
      }),

      Labelling: $resource(url + '/labels/', {}, {
        search: {
          method: 'GET',
          url: url + '/labels/components/search'
        },
        getComponentForm: {
          method: 'GET',
          url: url + '/labels/components/form'
        },
        getComponents: {
          method: 'GET',
          url: url + '/labels/donations/:donationIdentificationNumber/components',
          params: {componentType: '@componentType'}
        },
        getSafeComponents: {
          method: 'GET',
          url: url + '/labels/components'
        },
        printPackLabel: {
          method: 'GET',
          url: url + '/labels/print/packlabel/:componentId'
        },
        printDiscardLabel: {
          method: 'GET',
          url: url + '/labels/print/discardlabel/:componentId'
        },
        verifyPackLabel: {
          method: 'GET',
          url: url + '/labels/verify/packlabel',
          params: {componentId: '@componentId', prePrintedDIN: '@prePrintedDIN', packLabelDIN: '@packLabelDIN'}
        }
      }),

      FindDonationBatches: $resource(url + '/donationbatches/search', {},
        {
          query: {
            method: 'GET',
            params: {isClosed: '@isClosed', venues: '@venues'}
          }
        }
      ),

      TestResults: $resource(url + '/testresults/:donationIdentificationNumber', {din: '@donationIdentificationNumber'}, {
        form: {
          method: 'GET',
          url: url + '/testresults/form'
        },
        getTestSample: {
          method: 'GET',
          url: url + '/testresults/:donationIdentificationNumber/sample'
        },
        search: {
          method: 'GET',
          url: url + '/testresults/search'
        },
        overview: {
          method: 'GET',
          url: url + '/testresults/overview'
        },
        report: {
          method: 'GET',
          url: url + '/testresults/report'
        },
        saveResults: {
          method: 'POST',
          url: url + '/testresults'
        }
      }),

      Locations: $resource(url + '/locations/:id', {id: '@id'}, {
        update: {method: 'PUT'},
        getSearchForm: {
          method: 'GET',
          url: url + '/locations/search/form'
        },
        search: {
          method: 'GET',
          url: url + '/locations/search'
        },
        getForm: {
          method: 'GET',
          url: url + '/locations/form'
        }
      }),

      Configurations: $resource(url + '/configurations/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      PackTypes: $resource(url + '/packtypes/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      DiscardReasons: $resource(url + '/discardreasons/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      DonationTypes: $resource(url + '/donationtypes/:id', null,
        {
          update: {method: 'PUT'}
        }
      ),

      PasswordResets: $resource(url + '/passwordresets'),

      AuditRevisions: $resource(url + '/auditrevisions'),

      DonorPostDonationCounselling: $resource(url + '/donors/:donorId/postdonationcounselling'),

      PostDonationCounsellings: $resource(url + '/postdonationcounsellings/:id', {id: '@id'}, {
        getForm: {
          method: 'GET',
          url: url + '/postdonationcounsellings/form'
        },
        getSearchForm: {
          method: 'GET',
          url: url + '/postdonationcounsellings/searchForm'
        },
        update: {method: 'PUT'}
      }),

      AdverseEventTypes: $resource(url + '/adverseevents/types/:id', {id: '@id'}, {
        update: {method: 'PUT'}
      }),

      MobileClinicDonors: $resource(url + '/mobileclinic', {}, {
        getForm: {
          method: 'GET',
          url: url + '/mobileclinic/form'
        },
        search: {
          method: 'GET',
          url: url + '/mobileclinic/search'
        },
        export: {
          method: 'GET',
          url: url + '/mobileclinic/export'
        },
        getDonorOutcomesForm: {
          method: 'GET',
          url: url + '/mobileclinic/donoroutcomes/form'
        },
        getDonorOutcomes: {
          method: 'GET',
          url: url + '/mobileclinic/donoroutcomes'
        }
      }),

      DonationsReport: $resource(url + '/reports/collecteddonations/generate', {}, {
        getForm: {
          method: 'GET',
          url: url + '/reports/collecteddonations/form'
        }
      }),

      TTIPrevalenceReport: $resource(url + '/reports/ttiprevalence/generate', {}, {
        getForm: {
          method: 'GET',
          url: url + '/reports/ttiprevalence/form'
        }
      }),

      StockLevelsReport: $resource(url + '/reports/stockLevels', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/stockLevels/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/stockLevels/form'
        }
      }),

      BloodUnitsIssuedReport: $resource(url + '/reports/unitsissued', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/unitsissued/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/unitsissued/form'
        }
      }),

      DonorsDeferredReport: $resource(url + '/reports/donorsdeferred', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/donorsdeferred/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/donorsdeferred/form'
        }
      }),

      UnitsDiscardedReport: $resource(url + '/reports/discardedunits', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/discardedunits/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/discardedunits/form'
        }
      }),

      ComponentProductionReport: $resource(url + '/reports/componentsprocessed', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/componentsprocessed/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/componentsprocessed/form'
        }
      }),

      DonorsAdverseEventsReport: $resource(url + '/reports/donorsadverseevents', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/donorsadverseevents/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/donorsadverseevents/form'
        }
      }),

      TransfusionsReport: $resource(url + '/reports/transfusionsummary', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/transfusionsummary/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/transfusionsummary/form'
        }
      }),

      WhoReport: $resource(url + '/reports/whoreport', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/whoreport/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/whoreport/form'
        }
      }),
      DonationSummaryReport: $resource(url + '/reports/donationreport', {}, {
        generate: {
          method: 'GET',
          url: url + '/reports/donationreport/generate'
        },
        getForm: {
          method: 'GET',
          url: url + '/reports/donationreport/form'
        }
      }),

      OrderForms: $resource(url + '/orderforms/:id', {id: '@id'}, {
        update: {method: 'PUT'},
        search: {
          method: 'GET',
          url: url + '/orderforms/search'
        },
        getForm: {
          method: 'GET',
          url: url + '/orderforms/form'
        },
        getItemsForm: {
          method: 'GET',
          url: url + '/orderforms/items/form'
        }
      }),

      ReturnForms: $resource(url + '/returnforms/:id', {id: '@id'}, {
        update: {
          method: 'PUT'
        },
        search: {
          method: 'GET',
          url: url + '/returnforms/search'
        },
        getForm: {
          method: 'GET',
          url: url + '/returnforms/form'
        }
      }),

      Inventories: $resource(url + '/inventories/', {}, {
        search: {
          method: 'GET',
          url: url + '/inventories/search'
        },
        getSearchForm: {
          method: 'GET',
          url: url + '/inventories/search/form'
        },
        getInventory: {
          method: 'GET',
          url: url + '/inventories'
        }
      }),

      Divisions: $resource(url + '/divisions/:id', {id: '@id'}, {
        search: {
          method: 'GET',
          url: url + '/divisions/search'
        },
        update: {
          method: 'PUT'
        }
      }),

      TransfusionReactionTypes: $resource(url + '/transfusionreactiontypes/:id', {id: '@id'}, {
        search: {
          method: 'GET',
          url: url + '/transfusionreactiontypes/search'
        },
        add: {
          method: 'POST',
          url: url + '/transfusionreactiontypes'
        },
        update: {
          method: 'PUT'
        }
      }),

      Transfusion: $resource(url + '/transfusions/:id', {id: '@id'}, {
        getForm: {
          method: 'GET',
          url: url + '/transfusions/form'
        },
        save: {
          method: 'POST'
        },
        getSearchForm: {
          method: 'GET',
          url: url + '/transfusions/search/form'
        },
        search: {
          method: 'GET',
          url: url + '/transfusions/search'
        },
        update: {
          method: 'PUT'
        }
      }),

      DataExport: {
        download: function() {
          // using $http here because $resource cannot process arraybuffers easily
          return $http.get(url + '/dataexport', {responseType: 'arraybuffer'});
        }
      },

      ComponentTypeCombinations: $resource(url + '/componenttypecombinations/:id', {id: '@id'}, {
        search: {
          method: 'GET',
          url: url + '/componenttypecombinations/search'
        },
        update: {
          method: 'PUT'
        },
        getForm: {
          method: 'GET',
          url: url + '/componenttypecombinations/form'
        }
      }),

      BloodTests: $resource(url + '/bloodtests/:id', {id: '@id'}, {
        search: {
          method: 'GET',
          url: url + '/bloodtests/search'
        },
        getForm: {
          method: 'GET',
          url: url + '/bloodtests/form'
        },
        update: {
          method: 'PUT'
        }
      }),

      BloodTestingRules: $resource(url + '/bloodtestingrules/:id', {id: '@id'}, {
        search: {
          method: 'GET',
          url: url + '/bloodtestingrules/search'
        },
        getForm: {
          method: 'GET',
          url: url + '/bloodtestingrules/form'
        },
        save: {
          method: 'POST'
        },
        update: {
          method: 'PUT'
        }
      })
    };
  });
