import fg from 'fast-glob';
import * as path from 'path';
import { Compiler } from './common/Compiler';

import { DefaultLocFolderName, DefaultProjectSearchPattern } from './common/consts';

import { DiagnosticData } from './model/DiagnosticData';

export async function checkForErrors(rootPath: string, searchFolders?: string[]): Promise<DiagnosticData[]> {
  const patterns: string[] = [];

  if (!searchFolders) {
    patterns.push(DefaultProjectSearchPattern.replace('{folder}', DefaultLocFolderName));
  } else {
    for (const folder of searchFolders) {
      patterns.push(DefaultProjectSearchPattern.replace('{folder}', folder))
    }
  }

  const locDefinitionEntries = await fg(patterns, {
    absolute: true,
    objectMode: true,
    onlyFiles: true,
    cwd: rootPath
  });

  const results: DiagnosticData[] = [];

  for (const locDefinitionEntry of locDefinitionEntries) {
    const compiler = new Compiler(locDefinitionEntry.path);
    const compileErrors = await compiler.compile();

    if (!compileErrors) {
      continue;
    }

    results.push({
      errors: compileErrors,
      rootFolder: path.dirname(locDefinitionEntry.path)
    })
  }

  return results;
}

export * from './model';