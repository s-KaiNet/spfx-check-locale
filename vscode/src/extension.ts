import * as vs from 'vscode';
import * as path from 'path';
import { checkForErrors } from 'spfx-check-locale';

import { logger } from './Logger';
import { DiagnosticProvider } from './DiagnosticProvider';
import { createKeyFromPath, logError } from './Utils';

export async function activate(context: vs.ExtensionContext) {
  try {
    if (!vs.workspace.workspaceFolders || vs.workspace.workspaceFolders.length === 0) {
      logger.error('Unable to resolve WorkspaceFolder');
      return;
    }

    const rootWorkspace = vs.workspace.workspaceFolders[0];

    logger.log('Starting the extension');
    const start = new Date().getTime();

    const { diagnosticData, locFolders } = await checkForErrors({
      projectPath: rootWorkspace.uri.fsPath
    });

    const end = new Date().getTime() - start;

    let totalErrors = 0;

    for (const data of diagnosticData) {
      totalErrors += data.totalErrors;
    }

    logger.log(`Found ${locFolders.length} locale folder(s)`);
    logger.log(`Found ${totalErrors} error(s) in solution. Elapsed: ${end}ms`);

    const locFolderKeys = locFolders.map(f => createKeyFromPath(f));

    DiagnosticProvider.instance.applyDiagnostics(diagnosticData);

    context.subscriptions.push(vs.workspace.onDidSaveTextDocument(async (doc) => {
      try {
        if (!doc.uri.fsPath.endsWith('.d.ts') && !doc.uri.fsPath.endsWith('.js')) {
          return;
        }

        const folderPath = path.dirname(doc.uri.fsPath);
        const folderPathKey = createKeyFromPath(folderPath);

        // if file is not in observed in loc folders, return
        if (locFolderKeys.indexOf(folderPathKey) === -1) {
          return;
        }
        const start = new Date().getTime();
        logger.log(`Checking for errors a folder with path: '${folderPath}'`);

        const { diagnosticData } = await checkForErrors({
          projectPath: folderPath
        });

        DiagnosticProvider.instance.clearDiagnostics(folderPath);
        DiagnosticProvider.instance.applyDiagnostics(diagnosticData);
        const end = new Date().getTime() - start;

        let totalErrors = 0;
        for (const data of diagnosticData) {
          totalErrors += data.totalErrors;
        }

        logger.log(`Found ${totalErrors} error(s). Elapsed: ${end}ms`);
      }
      catch (e) {
        logError(e);
        throw e;
      }
    }));

    context.subscriptions.push(logger);
  }
  catch (e) {
    logError(e);
    throw e;
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  //
}
