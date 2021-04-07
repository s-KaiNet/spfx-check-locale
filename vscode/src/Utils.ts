import * as vs from 'vscode';
import { logger } from './Logger';

export function createKeyFromPath(path: string): string {
  return path.replace(/[/\\]/gi, '|').toLowerCase();
}

export function logError(e: any) {
  logger.error(e);
  vs.window.showErrorMessage('Error: ' + e?.message || e.toString());
}