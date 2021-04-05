import glob from 'fast-glob';
import * as path from 'path';
import { Compiler } from './common/Compiler';

import { DefaultProjectSearchPattern } from './common/consts';
import { Options } from './common/Options';
import { outputErrors } from './common/Utils';

import { DiagnosticData } from './model/DiagnosticData';

export async function checkForErrors(options: Options): Promise<DiagnosticData[]> {
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
    });
  }

  if (printErrors) {
    await outputErrors(results);
  }

  return results;
}

export * from './model';
export * from './common/Options';