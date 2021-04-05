import { codeFrameColumns, SourceLocation } from '@babel/code-frame';
import * as fs from 'fs';
import * as path from 'path';

import { DiagnosticData } from '../model';

export async function outputErrors(data: DiagnosticData[]): Promise<void> {
  if (!data || data.length === 0) {
    return;
  }

  for (const diagnostic of data) {                   // each "project" - loc folder with locale files
    for (const fileName in diagnostic.errors) {      // each file with error(s) in the "project"
      const errors = diagnostic.errors[fileName];
      for (const error of errors) {                  // each error in the file inside the "project"
        const location: SourceLocation = {
          start: { line: error.start.line, column: error.start.character },
          end: { line: error.end.line, column: error.end.character }
        };

        const filePath = path.join(diagnostic.rootFolder, fileName);
        const fileContent = (await fs.promises.readFile(filePath)).toString();
        const result = codeFrameColumns(fileContent, location, {
          message: error.message
        });

        // eslint-disable-next-line no-console
        console.log(result);
      }
    }
  }
}