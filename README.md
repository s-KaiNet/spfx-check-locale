# Checks that your localization files match the schema inside `mystrings.d.ts`

[![npm version](https://badge.fury.io/js/spfx-check-locale.svg)](https://badge.fury.io/js/spfx-check-locale)

`spfx-check-locale` is a Node.js module which allows you to check the consistency of your localization files inside SharePoint Framework projects, i.e. localization files match the schema inside `mystrings.d.ts`.

Also available as a [VSCode extension](https://github.com/s-KaiNet/spfx-check-locale/blob/master/vscode/README.md) to support nice real-time error reporting.

## How to use

### Install

`npm install spfx-check-locale --save-dev`

### Update `gulpfile.js`

```javascript
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
```

Now every time you build your SPFx solution for the production `spfx-check-locale` will check the consistency of all localization files, will print errors report and will fail a build if there are any errors.  

> Why on production build only? Because the checking takes from 1 to 3 seconds, thus no reason to make your `serve` process slower. Also, with [VSCode extension](https://github.com/s-KaiNet/spfx-check-locale/blob/master/vscode/README.md) you have nice real-time error highlights without hurting performance.

## API

### checkForErrors(options)

Asynchronously checks your SPFx project for inconsistencies in localization files

#### params

- `options` - required, options object with below properties:
  - `projectPath` - required string, an absolute path to your SPFx solution
  - `printErrors` - optional boolean, whether to print errors in console

#### returns

A promise, which resolves to a `CheckResults` object
