import * as vs from 'vscode';
import * as path from 'path';
import { checkForErrors } from 'spfx-locale-check';

import { createLogger } from './Logger';
import { DiagnosticProvider } from './DiagnosticProvider';

export async function activate(context: vs.ExtensionContext) {
  const logger = createLogger(context);

  try {
    /*
    const yoContent = (await fs.promises.readFile('.yo-rc.json')).toString();

    if (yoContent.indexOf('@microsoft/generator-sharepoint') === -1) {
      return;
    }
*/
    if (!vs.workspace.workspaceFolders) {
      throw new Error('Unable to resolve workspace folder');
    }

    const rootWorkspace = vs.workspace.workspaceFolders[0];
    const errors = await checkForErrors({
      rootPath: rootWorkspace.uri.fsPath
    });

    DiagnosticProvider.instance.applyDiagnostics(errors);

    // TODO - check that file is in /loc folder
    context.subscriptions.push(vs.workspace.onDidSaveTextDocument(async (doc) => {
      const folderPath = path.dirname(doc.uri.fsPath);
      const errors = await checkForErrors({
        rootPath: folderPath,
        definitionSearchPatterns: ['*.d.ts']
      });

      DiagnosticProvider.instance.clearDiagnostics(folderPath);
      DiagnosticProvider.instance.applyDiagnostics(errors);
    }));
  }
  catch (e) {
    logger.error(e);
    vs.window.showErrorMessage('Error: ' + e?.message || e.toString());
    throw e;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  //
}

/*
async function shouldRun(): Promise<bool> {
  const hasYo = await fs.promises.stat()
}

*/