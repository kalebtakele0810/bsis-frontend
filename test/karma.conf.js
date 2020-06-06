module.exports = function(config) {
  config.set({

    basePath: '../',

    files: [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/ng-table/dist/ng-table.js',
      'app/bower_components/angular-xeditable/dist/js/xeditable.js',
      'app/bower_components/angular-ui-select/dist/select.js',
      'app/bower_components/karma-read-json/karma-read-json.js',
      'app/bower_components/checklist-model/checklist-model.js',
      'app/bower_components/angular-messages/angular-messages.js',
      'app/bower_components/angular-tooltips/dist/angular-tooltips.min.js',
      'app/bower_components/angular-ui-grid/ui-grid.js',
      'app/bower_components/angular-loading-bar/build/loading-bar.min.js',
      'app/bower_components/angular-gettext/dist/angular-gettext.min.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'test/spec/**/*.js',
      'test/spec/*.js',
      {pattern: 'test/mockData/*.json', included: false}
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    singleRun: true,

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'app/scripts/**/*.js': ['coverage']
    }

  });
};
