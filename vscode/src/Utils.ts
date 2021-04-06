import * as vs from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { ExtensionName } from './consts';
import { Settings } from './Settings';
import { logger } from './Logger';

export function createKeyFromPath(path: string): string {
  return path.replace(/[/\\]/gi, '|').toLowerCase();
}

export function getSettings(): Settings {
  return {
    searchPatterns: vs.workspace.getConfiguration(ExtensionName).get('definition.search.patterns')
  }
}


export async function shouldRun(rootPath: string): Promise<boolean> {
  const gulpContent = (await fs.promises.readFile(path.join(rootPath, 'gulpfile.js'))).toString();

  return gulpContent.indexOf('@microsoft/sp-build-web') !== -1;
}

export function logError(e: any) {
  logger.error(e);
  vs.window.showErrorMessage('Error: ' + e?.message || e.toString());
}