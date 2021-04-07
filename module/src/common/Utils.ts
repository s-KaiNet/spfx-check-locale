/* eslint-disable no-console */
import { codeFrameColumns, SourceLocation } from '@babel/code-frame';
import chalk from 'chalk';
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
          start: { line: error.start.line + 1, column: error.start.character },
          end: { line: error.end.line + 1, column: error.end.character }
        };

        const filePath = path.join(diagnostic.rootFolder, fileName);
        const fileContent = (await fs.promises.readFile(filePath)).toString();
        const result = codeFrameColumns(fileContent, location, {
          message: error.message,
          highlightCode: true
        });

        console.log('');
        console.log(chalk.red.bold('ERROR in ') + chalk.cyan(path.join(diagnostic.rootFolder, fileName) + chalk.red.bold(':')));
        console.log('');
        console.log(result);
      }
    }
  }
}

export async function createSearchPatterns(projectPath: string): Promise<string[]> {
  const configPath = path.join(projectPath, 'config/config.json');
  
  // if projectPath is a root SPFx project, use config.json to find all folders with localized resources
  if (await checkFileExists(configPath)) {
    const patterns: string[] = [];
    const config = JSON.parse((await (await fs.promises.readFile(configPath)).toString()));

    for (const res in config.localizedResources) {
      const resourcePath: string = config.localizedResources[res];

      // skip node_modules resources
      if (!resourcePath.startsWith('lib/')) {
        continue;
      }

      const basePath = 'src' + path.dirname(resourcePath).slice(3);
      patterns.push(removeTrailingSlash(basePath) + '/*.d.ts');
    }

    // assume the projectPath is a path to a direct "loc" folder (used by VSCode extension)
    return patterns;
  }

  return ['*.d.ts'];
}

export function removeTrailingSlash(input: string): string{
  return input.replace(/\/$/, '');
}

export async function checkFileExists(filepath): Promise<boolean> {
  try {
    await fs.promises.access(filepath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
