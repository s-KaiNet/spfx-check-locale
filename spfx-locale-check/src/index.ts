import glob from 'fast-glob';
import * as path from 'path';
import { Compiler } from './common/Compiler';

import { DefaultProjectSearchPattern } from './common/consts';
import { Options } from './common/Options';
import { outputErrors } from './common/Utils';
import { CheckResults } from './model/CheckResults';
import { DiagnosticData } from './model/DiagnosticData';

export async function checkForErrors(options: Options): Promise<CheckResults> {
  const patterns: string[] = [];
  options = {
    printErrors: false,
    definitionSearchPatterns: [DefaultProjectSearchPattern],
    ...options
  };
  const { definitionSearchPatterns: searchPatterns, rootPath, printErrors } = options;

  for (const pattern of searchPatterns) {
    patterns.push(pattern);
  }

  const locDefinitionEntries = await glob(patterns, {
    absolute: true,
    objectMode: true,
    onlyFiles: true,
    cwd: rootPath
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