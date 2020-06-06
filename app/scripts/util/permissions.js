'use strict';

angular.module('bsis')

  .constant('PERMISSIONS', {

    // Authenticated Permission
    AUTHENTICATED: 'Authenticated',

    // Donor Permissions
    ADD_DONOR: 'Add Donor',
    VIEW_DONOR: 'View Donor',
    EDIT_DONOR: 'Edit Donor',
    VOID_DONOR: 'Void Donor',
    ADD_DEFERRAL: 'Add Deferral',
    VIEW_DEFERRAL: 'View Deferral',
    EDIT_DEFERRAL: 'Edit Deferral',
    VOID_DEFERRAL: 'Void Deferral',
    ADD_DONOR_CODE: 'Add Donor Code',
    VIEW_DONOR_CODE: 'View Donor Code',
    EDIT_DONOR_CODE: 'Edit Donor Code',
    VOID_DONOR_CODE: 'Void Donor Code',
    VIEW_DONOR_CODE_GROUP: 'View Donor Code Group',
    VIEW_DUPLICATE_DONORS: 'View Duplicate Donors',
    MERGE_DONORS: 'Merge Donors',

    // Donation Permissions
    ADD_DONATION: 'Add Donation',
    VIEW_DONATION: 'View Donation',
    EDIT_DONATION: 'Edit Donation',
    VOID_DONATION: 'Void Donation',

    //Donation Batch Permissions
    ADD_DONATION_BATCH: 'Add Donation Batch',
    VIEW_DONATION_BATCH: 'View Donation Batch',
    EDIT_DONATION_BATCH: 'Edit Donation Batch',
    VOID_DONATION_BATCH: 'Void Donation Batch',

    // Mobile Clinic Permissions
    IMPORT_CLINIC_DATA: 'Import Clinic Data',
    EXPORT_CLINIC_DATA: 'Export Clinic Data',

    // Component Permissions
    ADD_COMPONENT: 'Add Component',
    VIEW_COMPONENT: 'View Component',
    EDIT_COMPONENT: 'Edit Component',
    VOID_COMPONENT: 'Void Component',

    // Component Batch Permissions
    ADD_COMPONENT_BATCH: 'Add Component Batch',
    VIEW_COMPONENT_BATCH: 'View Component Batch',
    EDIT_COMPONENT_BATCH: 'Edit Component Batch',
    VOID_COMPONENT_BATCH: 'Void Component Batch',

    //Request Permissions
    ADD_REQUEST: 'Add Request',
    EDIT_REQUEST: 'Edit Request',
    VIEW_REQUEST: 'View Request',
    VOID_REQUEST: 'Void Request',

    //Test Results Permissions
    ADD_TEST_OUTCOME: 'Add Test Outcome',
    EDIT_TEST_OUTCOME: 'Edit Test Outcome',
    VIEW_TEST_OUTCOME: 'View Test Outcome',
    VOID_TEST_OUTCOME: 'Void Test Outcome',

    // TTI Testing permissions
    ADD_TTI_OUTCOME: 'Add TTI Outcome',
    EDIT_TTI_OUTCOME: 'Edit TTI Outcome',
    VIEW_TTI_OUTCOME: 'View TTI Outcome',

    //Test Batch Permissions
    ADD_TEST_BATCH: 'Add Test Batch',
    VIEW_TEST_BATCH: 'View Test Batch',
    EDIT_TEST_BATCH: 'Edit Test Batch',
    VOID_TEST_BATCH: 'Void Test Batch',

    // Blood Typing Permissions
    EDIT_BLOOD_TYPING_OUTCOMES: 'Edit Blood Typing Outcome',
    ADD_BLOOD_TYPING_OUTCOME: 'Add Blood Typing Outcome',
    VIEW_BLOOD_TYPING_OUTCOME: 'View Blood Typing Outcome',

    // Blood Bank Staff Permissions
    BLOOD_CROSS_MATCH_CHECK: 'Blood Cross Match Check',
    ISSUE_COMPONENT: 'Issue Component',

    // Inventory Permissions
    LABEL_COMPONENT: 'Label Component',
    ADD_TRANSFUSION_DATA: 'Add Transfusion Data',
    EDIT_TRANSFUSION_DATA: 'Edit Transfusion Data',
    VIEW_TRANSFUSION_DATA: 'View Transfusion Data',
    VOID_TRANSFUSION_DATA: 'Void Transfusion Data',

    // Discard Permissions
    DISCARD_COMPONENT: 'Discard Component',
    VIEW_DISCARDS: 'View Discards',

    // Order
    ADD_ORDER_FORM: 'Add Order Form',
    VIEW_ORDER_FORM: 'View Order Form',
    EDIT_ORDER_FORM: 'Edit Order Form',
    VOID_ORDER_FORM: 'Void Order Form',

    // Reporting Permissions
    DONATIONS_REPORTING: 'Reporting - Donations',
    REQUESTS_REPORTING: 'Reporting - Requests',
    TTI_REPORTING: 'Reporting - TTI Testing',
    COMPONENTS_REPORTING: 'Reporting - Components',
    DONORS_REPORTING: 'Reporting - Donors',
    TRANSFUSIONS_REPORTING: 'Reporting - Transfusions',

    // Admin and Super-User Permissions
    MANAGE_USERS: 'Manage Users',
    MANAGE_ROLES: 'Manage Roles',
    MANAGE_LOCATIONS: 'Manage Locations',
    MANAGE_DONATION_TYPES: 'Manage Donation Types',
    MANAGE_DONATION_CATEGORIES: 'Manage Donation Categories',
    MANAGE_COMPONENT_COMBINATIONS: 'Manage Component Combinations',
    MANAGE_CROSS_MATCH_TYPES: 'Manage Cross Match Types',
    MANAGE_BLOOD_TESTING_RULES: 'Manage Blood Testing Rules',
    MANAGE_PACK_TYPES: 'Manage Pack Types',
    MANAGE_DISCARD_REASONS: 'Manage Discard Reasons',
    MANAGE_DEFERRAL_REASONS: 'Manage Deferral Reasons',
    MANAGE_DONOR_CODES: 'Manage Donor Codes',
    MANAGE_DIAGNOSES_CODES: 'Manage Diagnoses Codes',
    MANAGE_LAB_SETUP: 'Manage Lab Setup',
    MANAGE_DATA_SETUP: 'Manage Data Setup',
    MANAGE_FORMS: 'Manage Forms',
    MANAGE_BACKUP_DATA: 'Manage Backup Data',
    MANAGE_BLOOD_TESTS: 'Manage Blood Tests',
    MANAGE_REQUESTS: 'Manage Requests',
    MANAGE_GENERAL_CONFIGS: 'Manage General Configs',
    MANAGE_COMPONENT_TYPES: 'Manage Component Types',
    MANAGE_TRANSFUSION_REACTION_TYPES: 'Manage Transfusion Reaction Types',

    //Page Control Permissions
    VIEW_DONOR_INFORMATION: 'View Donor Information',
    VIEW_DONATION_INFORMATION: 'View Donation Information',
    VIEW_MOBILE_CLINIC_INFORMATION: 'View Mobile Clinic Information',
    VIEW_MOBILE_CLINIC_EXPORT: 'View Mobile Clinic Export',
    VIEW_COMPONENT_INFORMATION: 'View Component Information',
    VIEW_TESTING_INFORMATION: 'View Testing Information',
    VIEW_BLOOD_BANK_INFORMATION: 'View Blood Bank Information',
    VIEW_INVENTORY_INFORMATION: 'View Inventory Information',
    VIEW_DISCARD_INFORMATION: 'View Discard Information',
    VIEW_REPORTING_INFORMATION: 'View Reporting Information',
    VIEW_ADMIN_INFORMATION: 'View Admin Information',
    VIEW_AUDIT_LOG: 'View Audit Log',

    // Make use of this temporary permission to hide/prevent access to areas of functionality not ready for use in production
    HIDDEN: 'Hidden Functionality',

    // Post Donation Counselling Permissions
    VIEW_POST_DONATION_COUNSELLING_DONORS: 'View Post Donation Counselling Donors',
    ADD_POST_DONATION_COUNSELLING: 'Add Post Donation Counselling',
    EDIT_POST_DONATION_COUNSELLING: 'Edit Post Donation Counselling',
    VIEW_POST_DONATION_COUNSELLING: 'View Post Donation Counselling',
    VOID_POST_DONATION_COUNSELLING: 'Void Post Donation Counselling',

    // Adverse Events Permissions
    MANAGE_ADVERSE_EVENTS: 'Manage Adverse Events',

    // Division Permissions
    MANAGE_DIVISIONS: 'Manage Divisions',

    // Data Export
    DATA_EXPORT: 'Data Export'
  })

  .run(function($rootScope, PERMISSIONS) {
    // add constant to rootScope so it is always available in the views and controllers
    $rootScope.permissions = PERMISSIONS;
  });
