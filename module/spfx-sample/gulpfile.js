'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

const checkLocales = require('spfx-check-locale').checkForErrors;

const argv = build.rig.getYargs().argv;
if (argv.production) {
  const check = build.subTask('check-locales', function (gulp, buildOptions, done) {
    checkLocales({
      projectPath: __dirname,
      printErrors: true
    })
      .then(result => {
        if (result.diagnosticData.length === 0) {
          done();
        } else {
          done('Found errors in localization files');
        }
      }).catch(done);
  });

  build.rig.addPostBuildTask(build.task('check-locales', check));
}


build.initialize(require('gulp'));
