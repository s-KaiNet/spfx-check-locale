import * as vs from 'vscode';
import * as path from 'path';
import { checkForErrors, DiagnosticData } from 'spfx-locale-check';

const collection = vs.languages.createDiagnosticCollection('test');

export async function activate(context: vs.ExtensionContext) {

  console.log('Congratulations, your extension "spfx-check-locale" is now active!');

  if (!vs.workspace.workspaceFolders) {
    throw new Error('Unable to resolve workspace folder');
  }

  const rootWorkspace = vs.workspace.workspaceFolders[0];
  const errors = await checkForErrors(rootWorkspace.uri.fsPath);

  highlightErrors(errors);

  const disposable = vs.commands.registerCommand('spfx-check-locale.helloWorld', () => {
    vs.window.showInformationMessage('Hello World from SPFx Check Locale!');
  });

  context.subscriptions.push(disposable);
}

// TODO - group and aggregate multiple by file
// TODO - clear if no errors
// TODO - for cli use https://babeljs.io/docs/en/babel-code-frame.html
function highlightErrors(data: DiagnosticData[]) {
  for (const diagnostic of data) {
    for (const fileName in diagnostic.errors) {
      const errorData = diagnostic.errors[fileName];
      const vsErrors: vs.Diagnostic[] = [];

      for (const error of errorData) {
        vsErrors.push({
          code: '',
          severity: vs.DiagnosticSeverity.Error,
          source: '',
          message: error.message,
          range: new vs.Range(new vs.Position(error.start.line, error.start.character), new vs.Position(error.end.line, error.end.character)),
        })
      }
      const uri = vs.Uri.file(path.join(diagnostic.rootFolder, fileName));
      collection.set(uri, vsErrors);
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  //
}