'use strict';

angular.module('bsis')
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .constant('ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
  })
  .constant('ICONS', {
    ACCOUNT: 'fa-cog',
    ARCHIVE: 'fa-archive',
    BARCODE: 'fa-barcode',
    BARS: 'fa-bars',
    CALENDAR: 'fa-calendar',
    CIRCLE: 'fa-circle',
    CIRCLEO: 'fa-circle-o',
    COMMENT: 'fa-comment',
    COMPONENTS: 'fa-filter',
    DONORS: 'fa-clipboard',
    EDIT: 'fa-edit',
    EXCLAMATION: 'fa-exclamation-circle',
    FEMALE: 'fa-female',
    FLAG: 'fa-flag',
    GLOBE: 'fa-globe',
    HOME: 'fa-home',
    INFO: 'fa-info',
    INFOCIRCLE: 'fa-info-circle',
    INVENTORY: 'fa-tint', //'fa-archive',
    LABELLING: 'fa-barcode',
    LOGOUT: 'fa-sign-out',
    MALE: 'fa-male',
    MOBILE: 'fa-truck',
    PHONE: 'fa-phone',
    PLUS: 'fa-plus-square',
    REMOVE: 'fa-times-circle',
    REPORTS: 'fa-bar-chart-o',
    SETTINGS: 'fa-cogs',
    SQUARE: 'fa-square-o',
    SQUARECHECK: 'fa-check-square-o',
    TESTING: 'fa-flask',
    TINT: 'fa-tint',
    USER: 'fa-user',
    VENUE: 'fa-hospital-o',
    WARNING: 'fa-warning',
    MAPMARKER: 'fa-map-marker'
  })

  .constant('REGEX', {
    INTEGER: /^\-?\d+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/,
    NAME: /^[a-zA-Z \-\.]*$/
  })

  .constant('BLOODGROUP', {
    options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  })
  .constant('BLOODABO', {
    options: ['A', 'B', 'AB', 'O']
  })
  .constant('BLOODRH', {
    options: ['+', '-']
  })
  .constant('MONTH', {
    'options': [
      {
        'id': 1,
        'name': 'January'
      },
      {
        'id': 2,
        'name': 'February'
      },
      {
        'id': 3,
        'name': 'March'
      },
      {
        'id': 4,
        'name': 'April'
      },
      {
        'id': 5,
        'name': 'May'
      },
      {
        'id': 6,
        'name': 'June'
      },
      {
        'id': 7,
        'name': 'July'
      },
      {
        'id': 8,
        'name': 'August'
      },
      {
        'id': 9,
        'name': 'September'
      },
      {
        'id': 10,
        'name': 'October'
      },
      {
        'id': 11,
        'name': 'November'
      },
      {
        'id': 12,
        'name': 'December'
      }
    ]
  })
  .constant('TITLE', {
    options: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']
  })
  .constant('GENDER', {
    'options': [
      {
        'id': 'male',
        'name': 'Male'
      },
      {
        'id': 'female',
        'name': 'Female'
      }
    ]
  })
  .constant('DATATYPES', {
    options: [
      {
        id: 1,
        datatype: 'text'
      },
      {
        'id': 2,
        'datatype': 'integer'
      },
      {
        'id': 3,
        'datatype': 'decimal'
      },
      {
        'id': 4,
        'datatype': 'boolean'
      },
      {
        'id': 5,
        'datatype': 'password'
      }
    ]
  })
  .constant('UI', UI) //eslint-disable-line no-undef
  .constant('DONATION', DONATION) //eslint-disable-line no-undef

;
