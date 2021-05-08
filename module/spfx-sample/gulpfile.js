'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

const checkLocales = require('spfx-check-locale').checkForErrors;

const argv = build.rig.getYargs().argv;
if (argv.production) {
  const check = build.subTask('check-locales', function (gulp, buildOptions, done) {
    checkLocales({
      projectPath: buildOptions.rootPath,
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
