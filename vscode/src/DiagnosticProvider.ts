import { DiagnosticData } from 'spfx-locale-check';
import * as vs from 'vscode';
import * as path from 'path';
import { createKeyFromPath } from './Utils';

export class DiagnosticProvider {
  private diagnosticsMap: { [key: string]: vs.DiagnosticCollection } = {};
  private static provider: DiagnosticProvider;
  private constructor() {
    //
  }
  public static get instance(): DiagnosticProvider {
    if (!DiagnosticProvider.provider) {
      DiagnosticProvider.provider = new DiagnosticProvider();
    }

    return DiagnosticProvider.provider;
  }

  public clearDiagnostics(folderPath: string) {
    const diagnosticCollection = this.ensureDiagnosticCollection(folderPath);
    diagnosticCollection.clear();
  }

  public applyDiagnostics(data: DiagnosticData[]) {
    for (const diagnostic of data) {

      const diagnosticCollection = this.ensureDiagnosticCollection(diagnostic.rootFolder);
      diagnosticCollection.clear();

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
        diagnosticCollection.set(uri, vsErrors);
      }
    }
  }

  private ensureDiagnosticCollection(folderPath: string): vs.DiagnosticCollection {
    folderPath = createKeyFromPath(folderPath);

    if (!this.diagnosticsMap[folderPath]) {
      this.diagnosticsMap[folderPath] = vs.languages.createDiagnosticCollection();
    }

    return this.diagnosticsMap[folderPath];
  }
}