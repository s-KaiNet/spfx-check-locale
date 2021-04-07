import glob from 'fast-glob';
import * as path from 'path';
import { Compiler } from './common/Compiler';

import { Options } from './common/Options';
import { createSearchPatterns, outputErrors } from './common/Utils';
import { CheckResults } from './model/CheckResults';
import { DiagnosticData } from './model/DiagnosticData';

export async function checkForErrors(options: Options): Promise<CheckResults> {
  options = {
    printErrors: false,
    ...options
  };
  const { projectPath, printErrors } = options;

  const locDefinitionEntries = await glob(await createSearchPatterns(projectPath), {
    absolute: true,
    objectMode: true,
    onlyFiles: true,
    cwd: projectPath,
    caseSensitiveMatch: false
  });

  const diagnosticData: DiagnosticData[] = [];

  for (const locDefinitionEntry of locDefinitionEntries) {
    const compiler = new Compiler(locDefinitionEntry.path);
    const compileErrors = await compiler.compile();
    let totalErrors = 0;

    for (const fileName in compileErrors) {
      totalErrors += compileErrors[fileName].length;
    }

    if (!compileErrors) {
      continue;
    }

    diagnosticData.push({
      errors: compileErrors,
      totalErrors,
      rootFolder: path.dirname(locDefinitionEntry.path)
    });
  }

  if (printErrors) {
    await outputErrors(diagnosticData);
  }

  return {
    diagnosticData: diagnosticData,
    locFolders: locDefinitionEntries.map(f => path.dirname(f.path))
  };
}

export * from './model';
export * from './common/Options';
export { DefaultProjectSearchPattern } from './common/consts';